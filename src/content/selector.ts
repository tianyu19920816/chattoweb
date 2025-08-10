import { SelectionMode } from '../shared/types'

export class ElementSelector {
  private mode: SelectionMode = 'single'
  private isActive = false
  private hoveredElement: Element | null = null
  private highlightElement: HTMLDivElement | null = null
  private highlightLabel: HTMLDivElement | null = null
  private onSelectCallback: (element: Element) => void
  private isSelecting = false
  private selectionBox: HTMLDivElement | null = null
  private startX = 0
  private startY = 0

  constructor(onSelect: (element: Element) => void) {
    this.onSelectCallback = onSelect
    this.createHighlightElement()
  }

  activate() {
    this.isActive = true
    // 确保高亮元素存在
    if (!this.highlightElement || !document.body.contains(this.highlightElement)) {
      this.createHighlightElement()
    }
    this.addEventListeners()
  }

  deactivate() {
    this.isActive = false
    this.removeEventListeners()
    this.hideHighlight()
    // 清理可能残留的选择框
    this.removeSelectionBox()
    this.isSelecting = false
  }

  setMode(mode: SelectionMode) {
    this.mode = mode
  }

  private createHighlightElement() {
    this.highlightElement = document.createElement('div')
    this.highlightElement.className = 'web-extractor-highlight'
    this.highlightElement.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 999999;
      background: rgba(59, 130, 246, 0.2);
      border: 2px solid rgba(59, 130, 246, 0.8);
      display: none;
      transition: all 0.2s ease;
    `
    document.body.appendChild(this.highlightElement)
  }

  private addEventListeners() {
    // 使用捕获阶段确保在其他事件处理之前执行
    document.addEventListener('mousemove', this.handleMouseMove, true)
    document.addEventListener('click', this.handleClick, true)
    document.addEventListener('mousedown', this.handleMouseDown, true)
    document.addEventListener('mouseup', this.handleMouseUp, true)
  }

  private removeEventListeners() {
    document.removeEventListener('mousemove', this.handleMouseMove, true)
    document.removeEventListener('click', this.handleClick, true)
    document.removeEventListener('mousedown', this.handleMouseDown, true)
    document.removeEventListener('mouseup', this.handleMouseUp, true)
  }

  private isFloatingPanelElement(element: Element | null): boolean {
    if (!element) return false
    
    // 检查元素是否属于浮窗
    const panel = document.getElementById('web-extractor-floating-panel')
    if (!panel) return false
    
    // 检查元素本身或其任何父元素是否是浮窗
    let current: Element | null = element
    while (current) {
      if (current === panel || current.id === 'web-extractor-floating-panel') {
        return true
      }
      current = current.parentElement
    }
    
    return false
  }
  
  private isOverlayElement(element: Element | null): boolean {
    if (!element) return false
    
    // 检查是否是我们创建的选框或overlay容器
    if (element.id === 'web-extractor-overlay-container') return true
    if (element.classList.contains('web-extractor-selected')) return true
    if (element.classList.contains('web-extractor-label')) return true
    if (element.classList.contains('web-extractor-controls')) return true
    if (element.classList.contains('web-extractor-remove-btn')) return true
    
    // 检查父元素是否是overlay容器
    let current: Element | null = element
    while (current) {
      if (current.id === 'web-extractor-overlay-container') return true
      if (current.classList.contains('web-extractor-selected')) return true
      current = current.parentElement
    }
    
    return false
  }

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isActive) return

    // 获取鼠标位置的真实元素（忽略我们的overlay）
    let element = document.elementFromPoint(e.clientX, e.clientY)
    
    // 如果是overlay元素，尝试获取下面的真实元素
    if (this.isOverlayElement(element)) {
      // 临时隐藏overlay容器
      const overlayContainer = document.getElementById('web-extractor-overlay-container')
      if (overlayContainer) {
        overlayContainer.style.pointerEvents = 'none'
        element = document.elementFromPoint(e.clientX, e.clientY)
        overlayContainer.style.pointerEvents = ''
      }
    }
    
    // 如果鼠标在浮窗上，隐藏高亮并返回
    if (this.isFloatingPanelElement(element)) {
      if (this.hoveredElement) {
        this.hoveredElement = null
        this.hideHighlight()
      }
      return
    }

    // 区域选择模式
    if (this.mode === 'area' && this.isSelecting) {
      this.updateSelectionBox(e.clientX, e.clientY)
      return
    }

    // 如果元素无效或是高亮框本身，返回
    if (!element || element === this.highlightElement) return

    // 只有元素改变时才更新
    if (element !== this.hoveredElement) {
      this.hoveredElement = element
      this.showHighlight(element)
    }
  }

  private handleClick = (e: MouseEvent) => {
    if (!this.isActive) return
    
    // 获取点击位置的真实元素
    let element = document.elementFromPoint(e.clientX, e.clientY)
    
    // 如果点击的是overlay元素，获取下面的真实元素
    if (this.isOverlayElement(element)) {
      // 临时隐藏overlay容器以获取下面的元素
      const overlayContainer = document.getElementById('web-extractor-overlay-container')
      if (overlayContainer) {
        overlayContainer.style.pointerEvents = 'none'
        element = document.elementFromPoint(e.clientX, e.clientY)
        overlayContainer.style.pointerEvents = ''
      }
    }
    
    // 如果点击的是浮窗，完全忽略
    if (this.isFloatingPanelElement(element)) {
      return
    }
    
    // 阻止默认行为和冒泡
    e.preventDefault()
    e.stopPropagation()

    // 区域选择模式不处理点击
    if (this.mode === 'area') return

    // 元素无效或是高亮框本身，返回
    if (!element || element === this.highlightElement) return

    // 触发选择回调
    this.onSelectCallback(element)
  }

  private handleMouseDown = (e: MouseEvent) => {
    if (!this.isActive || this.mode !== 'area') return
    
    // 获取鼠标位置的元素
    const element = document.elementFromPoint(e.clientX, e.clientY)
    
    // 如果在浮窗上，不开始区域选择
    if (this.isFloatingPanelElement(element)) {
      return
    }
    
    e.preventDefault()
    e.stopPropagation()

    this.isSelecting = true
    this.startX = e.clientX
    this.startY = e.clientY
    this.createSelectionBox()
  }

  private handleMouseUp = (e: MouseEvent) => {
    if (!this.isActive || this.mode !== 'area' || !this.isSelecting) return
    
    e.preventDefault()
    e.stopPropagation()

    this.isSelecting = false
    
    // 先获取选择框的位置信息
    const boxRect = this.selectionBox?.getBoundingClientRect()
    
    // 立即移除选择框
    this.removeSelectionBox()
    
    // 选择框内的元素
    if (boxRect) {
      this.selectElementsInRect(boxRect)
    }
  }

  private showHighlight(element: Element) {
    if (!this.highlightElement) return

    const rect = element.getBoundingClientRect()
    this.highlightElement.style.left = `${rect.left}px`
    this.highlightElement.style.top = `${rect.top}px`
    this.highlightElement.style.width = `${rect.width}px`
    this.highlightElement.style.height = `${rect.height}px`
    this.highlightElement.style.display = 'block'
    
    // 显示元素信息标签
    this.showHighlightLabel(element)
  }

  private hideHighlight() {
    if (this.highlightElement) {
      this.highlightElement.style.display = 'none'
    }
    this.hideHighlightLabel()
  }

  private showHighlightLabel(element: Element) {
    this.hideHighlightLabel()
    
    const rect = element.getBoundingClientRect()
    const tagName = element.tagName.toLowerCase()
    const id = element.id ? `#${element.id}` : ''
    const className = typeof element.className === 'string' && element.className ? `.${element.className.split(' ')[0]}` : ''
    const elementInfo = `${tagName}${id || className || ''}`
    
    this.highlightLabel = document.createElement('div')
    this.highlightLabel.className = 'web-extractor-highlight-label'
    this.highlightLabel.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top - 28}px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
      pointer-events: none;
      z-index: 999999;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      white-space: nowrap;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
    `
    
    this.highlightLabel.textContent = elementInfo
    document.body.appendChild(this.highlightLabel)
  }
  
  private hideHighlightLabel() {
    if (this.highlightLabel) {
      this.highlightLabel.remove()
      this.highlightLabel = null
    }
  }

  private createSelectionBox() {
    this.selectionBox = document.createElement('div')
    this.selectionBox.style.cssText = `
      position: fixed;
      z-index: 999998;
      border: 2px dashed rgba(59, 130, 246, 0.8);
      background: rgba(59, 130, 246, 0.1);
      pointer-events: none;
    `
    document.body.appendChild(this.selectionBox)
  }

  private updateSelectionBox(currentX: number, currentY: number) {
    if (!this.selectionBox) return

    const left = Math.min(this.startX, currentX)
    const top = Math.min(this.startY, currentY)
    const width = Math.abs(currentX - this.startX)
    const height = Math.abs(currentY - this.startY)

    this.selectionBox.style.left = `${left}px`
    this.selectionBox.style.top = `${top}px`
    this.selectionBox.style.width = `${width}px`
    this.selectionBox.style.height = `${height}px`
  }

  private removeSelectionBox() {
    if (this.selectionBox) {
      if (this.selectionBox.parentNode) {
        this.selectionBox.remove()
      }
      this.selectionBox = null
    }
  }

  private selectElementsInRect(boxRect: DOMRect) {
    const elements = document.querySelectorAll('*')
    const candidateElements: Element[] = []

    // 首先收集所有在框内的元素
    elements.forEach(element => {
      const rect = element.getBoundingClientRect()
      
      // 检查元素是否在选择框内
      if (rect.left >= boxRect.left &&
          rect.top >= boxRect.top &&
          rect.right <= boxRect.right &&
          rect.bottom <= boxRect.bottom &&
          element !== this.highlightElement &&
          !element.classList.contains('web-extractor-highlight') &&
          !element.classList.contains('web-extractor-selected') &&
          !element.classList.contains('web-extractor-label') &&
          !element.classList.contains('web-extractor-overlay') &&
          !this.isFloatingPanelElement(element) &&
          !this.isOverlayElement(element)) {
        candidateElements.push(element)
      }
    })
    
    // 过滤掉已有父元素被选中的子元素
    const finalElements: Element[] = []
    candidateElements.forEach(element => {
      let hasParentInSelection = false
      let parent = element.parentElement
      
      // 检查是否有父元素也在候选列表中
      while (parent && !hasParentInSelection) {
        if (candidateElements.includes(parent)) {
          hasParentInSelection = true
        }
        parent = parent.parentElement
      }
      
      // 只选择没有父元素在列表中的元素
      if (!hasParentInSelection) {
        finalElements.push(element)
      }
    })
    
    // 批量回调选中的元素
    finalElements.forEach(element => {
      this.onSelectCallback(element)
    })
  }
}