import { ElementInfo, Message, SelectedElement, SelectionMode } from '../shared/types'
import { getElementInfo } from '../shared/utils/dom'
import { ElementSelector } from './selector'
import { OverlayManager } from './overlay'
import { FloatingPanel } from './floating-panel-simple'
import './styles.css'

class ContentScript {
  private selector: ElementSelector
  private overlay: OverlayManager
  private floatingPanel: FloatingPanel
  private isActive = false
  private mode: SelectionMode = 'multiple'
  private selectedElements: Map<string, SelectedElement> = new Map()

  constructor() {
    console.log('ContentScript initializing...')
    this.selector = new ElementSelector(this.handleElementSelect.bind(this))
    this.overlay = new OverlayManager()
    this.floatingPanel = new FloatingPanel()
    this.initMessageListener()
    this.initKeyboardShortcuts()
    this.initPageUnloadListener()
    console.log('ContentScript initialized')
  }

  private initMessageListener() {
    // 监听来自background的消息
    chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
      console.log('ContentScript received message:', message)
      switch (message.type) {
        case 'TOGGLE_PANEL':
          console.log('Toggling panel')
          this.floatingPanel.toggle()
          sendResponse({ success: true })
          break
        case 'ACTIVATE_SELECTION':
          this.activate()
          sendResponse({ success: true })
          break
        case 'DEACTIVATE_SELECTION':
          this.deactivate()
          sendResponse({ success: true })
          break
        case 'SET_MODE':
          this.setMode(message.payload.mode)
          sendResponse({ success: true })
          break
        case 'CLEAR_SELECTION':
          this.clearSelection()
          sendResponse({ success: true })
          break
        case 'GET_STATE':
          sendResponse({
            isActive: this.isActive,
            mode: this.mode,
            selectedElements: Array.from(this.selectedElements.values())
          })
          break
        case 'TOGGLE_SELECTION':
          if (this.isActive) {
            this.deactivate()
          } else {
            this.activate()
          }
          sendResponse({ success: true })
          break
        case 'REMOVE_ELEMENT':
          this.deselectElement(message.payload.id)
          sendResponse({ success: true })
          break
        default:
          sendResponse({ success: false, error: 'Unknown message type' })
      }
      return true
    })
  }

  private initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // 切换选择模式
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault()
        this.isActive ? this.deactivate() : this.activate()
      }
      
      // 仅在选择模式激活时响应
      if (this.isActive) {
        // ESC - 清除所有选择并退出选择模式
        if (e.key === 'Escape') {
          e.preventDefault()
          this.clearSelection()
          this.deactivate()
        }
        
        // Ctrl+A - 选择所有相似元素
        if (e.ctrlKey && e.key === 'a') {
          e.preventDefault()
          this.selectAllSimilar()
        }
        
        // Delete 或 Backspace - 删除最后一个选择的元素
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault()
          this.removeLastSelected()
        }
      }
    })
  }

  private initPageUnloadListener() {
    // 监听页面即将卸载事件（刷新、导航等）
    window.addEventListener('beforeunload', () => {
      // 清除所有选择和状态
      this.clearSelection()
      this.cleanupUI()
    })
    
    // 监听页面可见性改变
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 页面隐藏时保存状态
        this.saveState()
      }
    })
  }

  private activate() {
    this.isActive = true
    this.selector.activate()
    this.overlay.show()
    document.body.classList.add('web-extractor-active')
    this.floatingPanel.updateStatus(true)
    this.sendStateUpdate()
  }

  private deactivate() {
    this.isActive = false
    this.selector.deactivate()
    this.overlay.hide()
    document.body.classList.remove('web-extractor-active')
    // 清理所有可能残留的UI元素
    this.cleanupUI()
    this.floatingPanel.updateStatus(false)
    this.sendStateUpdate()
  }

  private setMode(mode: SelectionMode) {
    this.mode = mode
    this.selector.setMode(mode)
    // 切换模式时重新激活选择器，确保状态正确
    if (this.isActive) {
      this.selector.deactivate()
      this.selector.activate()
    }
    this.sendStateUpdate()
  }

  private handleElementSelect(element: Element) {
    // 检查元素是否已经被选中（通过比较DOM元素本身）
    let existingId: string | undefined
    
    for (const [id, selected] of this.selectedElements.entries()) {
      // 通过CSS选择器找到对应的DOM元素并比较
      const existingElement = document.querySelector(selected.elementInfo.cssSelector)
      if (existingElement === element) {
        existingId = id
        break
      }
    }
    
    if (existingId) {
      // 如果元素已选中，则取消选中
      this.deselectElement(existingId)
    } else {
      // 新选择元素
      if (this.mode === 'single') {
        this.clearSelection()
      }
      
      const elementId = this.generateElementId(element)
      const elementInfo = getElementInfo(element) as ElementInfo
      elementInfo.id = elementId
      
      const selectedElement: SelectedElement = {
        id: elementId,
        elementInfo,
        timestamp: Date.now()
      }
      
      this.selectedElements.set(elementId, selectedElement)
      this.overlay.addSelectedElement(element, elementId)
      
      if (this.mode === 'smart') {
        this.selectSimilarElements(element)
      }
      
      // 只在元素存在时发送选中事件
      this.sendElementSelected(selectedElement)
    }
    
    this.sendStateUpdate()
  }

  private deselectElement(elementId: string) {
    this.selectedElements.delete(elementId)
    this.overlay.removeSelectedElement(elementId)
    this.sendStateUpdate()
  }

  private clearSelection() {
    this.selectedElements.clear()
    this.overlay.clearAllSelections()
    this.sendStateUpdate()
  }

  private selectAllSimilar() {
    if (this.selectedElements.size === 0) return
    
    const lastSelected = Array.from(this.selectedElements.values()).pop()
    if (!lastSelected) return
    
    const element = document.querySelector(lastSelected.elementInfo.cssSelector)
    if (element) {
      this.selectSimilarElements(element)
    }
  }

  private selectSimilarElements(baseElement: Element) {
    const tagName = baseElement.tagName
    const className = typeof baseElement.className === 'string' ? baseElement.className : ''
    
    const selector = tagName.toLowerCase() + 
      (className ? `.${className.split(' ').join('.')}` : '')
    
    const similar = document.querySelectorAll(selector)
    similar.forEach(el => {
      if (el !== baseElement) {
        const elementId = this.generateElementId(el)
        if (!this.selectedElements.has(elementId)) {
          const elementInfo = getElementInfo(el) as ElementInfo
          elementInfo.id = elementId
          
          const selectedElement: SelectedElement = {
            id: elementId,
            elementInfo,
            timestamp: Date.now()
          }
          
          this.selectedElements.set(elementId, selectedElement)
          this.overlay.addSelectedElement(el, elementId)
        }
      }
    })
    
    this.sendStateUpdate()
  }

  private removeLastSelected() {
    if (this.selectedElements.size === 0) return
    
    const lastId = Array.from(this.selectedElements.keys()).pop()
    if (lastId) {
      this.deselectElement(lastId)
    }
  }

  private generateElementId(element: Element): string {
    // 使用元素的位置和标签生成稳定的ID，不包含时间戳
    const rect = element.getBoundingClientRect()
    const path = this.getElementPath(element)
    return `${element.tagName}_${Math.round(rect.x)}_${Math.round(rect.y)}_${path}`
  }
  
  private getElementPath(element: Element): string {
    // 获取元素在DOM中的路径，用于生成唯一标识
    const path: string[] = []
    let current: Element | null = element
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase()
      if (current.id) {
        selector += `#${current.id}`
      } else if (typeof current.className === 'string' && current.className) {
        selector += `.${current.className.split(' ')[0]}`
      }
      path.unshift(selector)
      current = current.parentElement
    }
    
    return path.join('>')
  }
  
  private cleanupUI() {
    // 清理所有可能残留的选择框和overlay元素，但不删除selector的高亮框
    document.querySelectorAll('.web-extractor-overlay, .web-extractor-selected, .web-extractor-label').forEach(el => {
      el.remove()
    })
    // 清理提示框
    const tooltip = document.getElementById('web-extractor-tooltip')
    if (tooltip) {
      tooltip.remove()
    }
  }

  private sendStateUpdate() {
    const elements = Array.from(this.selectedElements.values())
    
    // 更新浮窗显示
    this.floatingPanel.updateElements(elements)
    
    // 发送给background
    chrome.runtime.sendMessage({
      type: 'STATE_UPDATE',
      from: 'content',
      payload: {
        isActive: this.isActive,
        mode: this.mode,
        selectedElements: elements
      }
    })
  }

  private sendElementSelected(element: SelectedElement) {
    chrome.runtime.sendMessage({
      type: 'ELEMENT_SELECTED',
      from: 'content',
      payload: element
    })
  }


  private saveState() {
    // 可选：保存当前状态到sessionStorage
    // 这样如果用户想要恢复状态可以提供该功能
    if (this.selectedElements.size > 0) {
      const state = {
        elements: Array.from(this.selectedElements.values()),
        mode: this.mode,
        isActive: this.isActive
      }
      sessionStorage.setItem('web-extractor-state', JSON.stringify(state))
    }
  }
}

new ContentScript()