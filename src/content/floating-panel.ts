import { SelectedElement, SelectionMode } from '../shared/types'

export class FloatingPanel {
  private container: HTMLDivElement
  private isVisible = false
  private isDragging = false
  private dragOffset = { x: 0, y: 0 }
  private position = { x: 20, y: 20 }
  
  // UI 元素
  private panel: HTMLDivElement | null = null
  private modeButtons: Map<SelectionMode, HTMLButtonElement> = new Map()
  private elementsList: HTMLDivElement | null = null
  private outputArea: HTMLTextAreaElement | null = null
  
  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'web-extractor-floating-panel'
    this.init()
  }
  
  private init() {
    this.createStyles()
    this.createPanel()
    this.attachEventListeners()
    // 确保容器被添加到页面
    if (!document.body.contains(this.container)) {
      document.body.appendChild(this.container)
      console.log('FloatingPanel container added to body')
    }
  }
  
  private createStyles() {
    // 检查是否已经添加了样式
    if (document.getElementById('web-extractor-floating-panel-styles')) {
      return
    }
    
    const style = document.createElement('style')
    style.id = 'web-extractor-floating-panel-styles'
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      #web-extractor-floating-panel {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
        z-index: 2147483646 !important;
      }
      
      #web-extractor-floating-panel .floating-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 380px;
        max-height: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 2147483647;
        display: none;
        flex-direction: column;
        transition: opacity 0.3s ease, box-shadow 0.3s ease;
        pointer-events: auto;
      }
      
      #web-extractor-floating-panel .floating-panel.visible {
        display: flex !important;
      }
      
      #web-extractor-floating-panel .panel-header {
        padding: 12px 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px 12px 0 0;
        cursor: move;
        user-select: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .panel-title {
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .panel-controls {
        display: flex;
        gap: 8px;
      }
      
      .control-btn {
        width: 20px;
        height: 20px;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      
      .control-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .panel-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      
      .mode-selector {
        padding: 12px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        gap: 8px;
      }
      
      .mode-btn {
        flex: 1;
        padding: 8px;
        border: 1px solid #e5e7eb;
        background: white;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .mode-btn.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }
      
      .mode-btn:hover:not(.active) {
        background: #f3f4f6;
      }
      
      .action-buttons {
        padding: 12px;
        display: flex;
        gap: 8px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .action-btn {
        flex: 1;
        padding: 10px;
        border: none;
        background: #667eea;
        color: white;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .action-btn:hover {
        background: #5a67d8;
      }
      
      .action-btn.danger {
        background: #ef4444;
      }
      
      .action-btn.danger:hover {
        background: #dc2626;
      }
      
      .elements-section {
        padding: 12px;
        border-bottom: 1px solid #e5e7eb;
        max-height: 200px;
        overflow-y: auto;
      }
      
      .section-title {
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 8px;
      }
      
      .elements-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .element-item {
        padding: 8px;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
      
      .element-tag {
        color: #667eea;
        font-weight: 500;
      }
      
      .element-text {
        color: #6b7280;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .element-actions {
        display: flex;
        gap: 4px;
      }
      
      .element-copy {
        width: 20px;
        height: 20px;
        border: none;
        background: #10b981;
        color: white;
        border-radius: 3px;
        cursor: pointer;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      
      .element-copy:hover {
        background: #059669;
      }
      
      .element-remove {
        width: 20px;
        height: 20px;
        border: none;
        background: #ef4444;
        color: white;
        border-radius: 3px;
        cursor: pointer;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      
      .element-remove:hover {
        background: #dc2626;
      }
      
      .output-section {
        flex: 1;
        padding: 12px;
        display: flex;
        flex-direction: column;
        min-height: 150px;
      }
      
      .output-area {
        flex: 1;
        padding: 10px;
        background: #1e293b;
        color: #e2e8f0;
        border: none;
        border-radius: 6px;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 11px;
        line-height: 1.5;
        resize: none;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      
      .output-actions {
        margin-top: 8px;
        display: flex;
        gap: 8px;
      }
      
      .copy-btn {
        flex: 1;
        padding: 8px;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .copy-btn:hover {
        background: #059669;
      }
      
      .copy-btn.copied {
        background: #059669;
      }
      
      .status-bar {
        padding: 8px 12px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        border-radius: 0 0 12px 12px;
        font-size: 11px;
        color: #6b7280;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .status-indicator {
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
        display: inline-block;
        margin-right: 6px;
      }
      
      .status-indicator.inactive {
        background: #ef4444;
      }
      
      .empty-state {
        padding: 24px;
        text-align: center;
        color: #9ca3af;
        font-size: 12px;
      }
    `
    // 将样式添加到页面头部
    document.head.appendChild(style)
  }
  
  private createPanel() {
    this.panel = document.createElement('div')
    this.panel.className = 'floating-panel'
    
    this.panel.innerHTML = `
      <div class="panel-header">
        <div class="panel-title">
          <span>🎯</span>
          <span>元素提取器</span>
        </div>
        <div class="panel-controls">
          <button class="control-btn" id="close-btn">×</button>
        </div>
      </div>
      
      <div class="panel-body">
        <div class="mode-selector">
          <button class="mode-btn" data-mode="single">单选</button>
          <button class="mode-btn active" data-mode="multiple">多选</button>
          <button class="mode-btn" data-mode="area">区域选择</button>
          <button class="mode-btn" data-mode="smart">相似元素</button>
        </div>
        
        <div class="action-buttons">
          <button class="action-btn" id="start-select">开始选择</button>
          <button class="action-btn danger" id="clear-all">清除全部</button>
        </div>
        
        <div class="elements-section">
          <div class="section-title">已选择元素 (<span id="element-count">0</span>)</div>
          <div class="elements-list" id="elements-list">
            <div class="empty-state">暂无选中元素</div>
          </div>
        </div>
        
        <div class="output-section">
          <div class="section-title">输出数据</div>
          <textarea class="output-area" id="output-area" readonly placeholder="选择元素后，这里将显示提取的数据"></textarea>
          <div class="output-actions">
            <button class="copy-btn" id="copy-output">复制所有</button>
          </div>
        </div>
      </div>
      
      <div class="status-bar">
        <div>
          <span class="status-indicator inactive" id="status-indicator"></span>
          <span id="status-text">未激活</span>
        </div>
        <div id="status-mode">模式: 多选</div>
      </div>
    `
    
    this.container.appendChild(this.panel)
    
    // 保存元素引用
    this.elementsList = this.panel.querySelector('#elements-list')
    this.outputArea = this.panel.querySelector('#output-area') as HTMLTextAreaElement
    
    // 保存模式按钮引用
    const modeButtons = this.panel.querySelectorAll('.mode-btn')
    modeButtons.forEach(btn => {
      const mode = btn.getAttribute('data-mode') as SelectionMode
      if (mode) {
        this.modeButtons.set(mode, btn as HTMLButtonElement)
      }
    })
  }
  
  private attachEventListeners() {
    const header = this.panel?.querySelector('.panel-header') as HTMLElement
    const closeBtn = this.panel?.querySelector('#close-btn')
    const startBtn = this.panel?.querySelector('#start-select')
    const clearBtn = this.panel?.querySelector('#clear-all')
    const copyBtn = this.panel?.querySelector('#copy-output')
    
    // 拖拽功能
    header?.addEventListener('mousedown', this.handleDragStart.bind(this))
    
    // 控制按钮
    closeBtn?.addEventListener('click', this.handleClose.bind(this))
    
    // 功能按钮
    startBtn?.addEventListener('click', this.handleStartSelect.bind(this))
    clearBtn?.addEventListener('click', this.handleClearAll.bind(this))
    copyBtn?.addEventListener('click', this.handleCopyOutput.bind(this))
    
    // 模式切换
    this.modeButtons.forEach((btn, mode) => {
      btn.addEventListener('click', () => this.handleModeChange(mode))
    })
  }
  
  private handleDragStart(e: MouseEvent) {
    // 阻止文本选择
    e.preventDefault()
    
    this.isDragging = true
    const rect = this.panel!.getBoundingClientRect()
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    
    // 添加拖拽时的样式
    if (this.panel) {
      this.panel.style.cursor = 'grabbing'
      this.panel.style.userSelect = 'none'
    }
    
    document.addEventListener('mousemove', this.handleDragMove)
    document.addEventListener('mouseup', this.handleDragEnd)
  }
  
  private handleDragMove = (e: MouseEvent) => {
    if (!this.isDragging || !this.panel) return
    
    // 直接更新位置，不使用 requestAnimationFrame 以获得更好的跟随性
    const x = e.clientX - this.dragOffset.x
    const y = e.clientY - this.dragOffset.y
    
    // 限制在视窗内
    const maxX = window.innerWidth - this.panel.offsetWidth
    const maxY = window.innerHeight - this.panel.offsetHeight
    
    this.position.x = Math.max(0, Math.min(x, maxX))
    this.position.y = Math.max(0, Math.min(y, maxY))
    
    // 使用 transform 以获得更好的性能
    this.panel.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`
    this.panel.style.left = '0'
    this.panel.style.top = '0'
    this.panel.style.right = 'auto'
  }
  
  private handleDragEnd = () => {
    this.isDragging = false
    
    // 恢复样式
    if (this.panel) {
      this.panel.style.cursor = ''
      this.panel.style.userSelect = ''
    }
    
    document.removeEventListener('mousemove', this.handleDragMove)
    document.removeEventListener('mouseup', this.handleDragEnd)
  }
  
  private handleClose() {
    // 先清除所有选中的元素
    this.handleClearAll()
    // 停止选择模式
    chrome.runtime.sendMessage({
      type: 'DEACTIVATE_SELECTION',
      from: 'panel'
    })
    // 隐藏浮窗
    this.hide()
  }
  
  private handleStartSelect() {
    chrome.runtime.sendMessage({
      type: 'TOGGLE_SELECTION',
      from: 'panel'
    })
  }
  
  private handleClearAll() {
    chrome.runtime.sendMessage({
      type: 'CLEAR_SELECTION',
      from: 'panel'
    })
    this.updateElements([])
  }
  
  private handleModeChange(mode: SelectionMode) {
    
    // 更新按钮状态
    this.modeButtons.forEach((btn, btnMode) => {
      if (btnMode === mode) {
        btn.classList.add('active')
      } else {
        btn.classList.remove('active')
      }
    })
    
    // 更新状态栏
    const statusMode = this.panel?.querySelector('#status-mode')
    if (statusMode) {
      const modeText = {
        single: '单选',
        multiple: '多选',
        area: '区域选择',
        smart: '相似元素'
      }
      statusMode.textContent = `模式: ${modeText[mode]}`
    }
    
    // 发送模式变更消息
    chrome.runtime.sendMessage({
      type: 'SET_MODE',
      from: 'panel',
      payload: { mode }
    })
  }
  
  private handleCopyOutput() {
    if (!this.outputArea) return
    
    const text = this.outputArea.value
    if (!text) return
    
    navigator.clipboard.writeText(text).then(() => {
      const copyBtn = this.panel?.querySelector('#copy-output') as HTMLButtonElement
      if (copyBtn) {
        copyBtn.textContent = '已复制!'
        copyBtn.classList.add('copied')
        setTimeout(() => {
          copyBtn.textContent = '复制所有'
          copyBtn.classList.remove('copied')
        }, 2000)
      }
    })
  }
  
  private copyElementData(element: SelectedElement) {
    // 生成单个元素的格式化数据
    const elementData = {
      selector: element.elementInfo.cssSelector,
      tagName: element.elementInfo.tagName,
      text: element.elementInfo.text?.substring(0, 100),
      attributes: Object.entries(element.elementInfo.attributes)
        .filter(([key]) => ['id', 'class', 'type', 'name', 'href', 'src'].includes(key))
        .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {}),
      position: {
        x: Math.round(element.elementInfo.boundingBox.x),
        y: Math.round(element.elementInfo.boundingBox.y),
        width: Math.round(element.elementInfo.boundingBox.width),
        height: Math.round(element.elementInfo.boundingBox.height)
      }
    }
    
    const text = JSON.stringify(elementData, null, 2)
    
    navigator.clipboard.writeText(text).then(() => {
      // 提供视觉反馈
      const copyBtn = this.panel?.querySelector(`.element-copy[data-id="${element.id}"]`) as HTMLButtonElement
      if (copyBtn) {
        const originalText = copyBtn.textContent
        copyBtn.textContent = '✓'
        copyBtn.style.background = '#059669'
        setTimeout(() => {
          copyBtn.textContent = originalText
          copyBtn.style.background = ''
        }, 1500)
      }
    }).catch(err => {
      console.error('复制失败:', err)
    })
  }
  
  show() {
    console.log('FloatingPanel.show() called')
    this.isVisible = true
    if (this.panel) {
      this.panel.classList.add('visible')
      console.log('Panel classes:', this.panel.className)
      console.log('Panel visible:', this.panel.classList.contains('visible'))
      // 初始化位置
      if (this.position.x === 20 && this.position.y === 20) {
        this.panel.style.transform = `translate(${window.innerWidth - 400}px, 20px)`
        this.position.x = window.innerWidth - 400
        this.position.y = 20
      }
    } else {
      console.error('Panel element not found!')
    }
    console.log('Container parent:', this.container.parentElement)
  }
  
  hide() {
    console.log('FloatingPanel.hide() called')
    this.isVisible = false
    this.panel?.classList.remove('visible')
  }
  
  toggle() {
    console.log('FloatingPanel.toggle() called, isVisible:', this.isVisible)
    if (this.isVisible) {
      this.hide()
    } else {
      this.show()
    }
  }
  
  updateStatus(isActive: boolean) {
    const indicator = this.panel?.querySelector('#status-indicator')
    const statusText = this.panel?.querySelector('#status-text')
    const startBtn = this.panel?.querySelector('#start-select') as HTMLButtonElement
    
    if (indicator) {
      if (isActive) {
        indicator.classList.remove('inactive')
      } else {
        indicator.classList.add('inactive')
      }
    }
    
    if (statusText) {
      statusText.textContent = isActive ? '选择中' : '未激活'
    }
    
    if (startBtn) {
      startBtn.textContent = isActive ? '停止选择' : '开始选择'
    }
  }
  
  updateElements(elements: SelectedElement[]) {
    
    // 更新计数
    const count = this.panel?.querySelector('#element-count')
    if (count) {
      count.textContent = elements.length.toString()
    }
    
    // 更新列表
    if (this.elementsList) {
      if (elements.length === 0) {
        this.elementsList.innerHTML = '<div class="empty-state">暂无选中元素</div>'
      } else {
        this.elementsList.innerHTML = elements.map(el => `
          <div class="element-item" data-id="${el.id}">
            <div style="flex: 1; overflow: hidden;">
              <span class="element-tag">&lt;${el.elementInfo.tagName}&gt;</span>
              <span class="element-text">${el.elementInfo.text || el.elementInfo.className || ''}</span>
            </div>
            <div class="element-actions">
              <button class="element-copy" data-id="${el.id}" title="复制">📋</button>
              <button class="element-remove" data-id="${el.id}" title="删除">×</button>
            </div>
          </div>
        `).join('')
        
        // 添加复制事件
        this.elementsList.querySelectorAll('.element-copy').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation()
            const id = (e.currentTarget as HTMLElement).getAttribute('data-id')
            const element = elements.find(el => el.id === id)
            if (element) {
              this.copyElementData(element)
            }
          })
        })
        
        // 添加删除事件
        this.elementsList.querySelectorAll('.element-remove').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation()
            const id = (e.currentTarget as HTMLElement).getAttribute('data-id')
            if (id) {
              chrome.runtime.sendMessage({
                type: 'REMOVE_ELEMENT',
                from: 'panel',
                payload: { id }
              })
            }
          })
        })
      }
    }
    
    // 更新输出
    this.updateOutput(elements)
  }
  
  private updateOutput(elements: SelectedElement[]) {
    if (!this.outputArea || elements.length === 0) {
      if (this.outputArea) {
        this.outputArea.value = ''
      }
      return
    }
    
    // 生成推荐格式的输出（结构化的精简格式）
    const output = {
      elements: elements.map(el => ({
        selector: el.elementInfo.cssSelector,
        tagName: el.elementInfo.tagName,
        text: el.elementInfo.text?.substring(0, 100),
        attributes: Object.entries(el.elementInfo.attributes)
          .filter(([key]) => ['id', 'class', 'type', 'name', 'href', 'src'].includes(key))
          .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {}),
        position: {
          x: Math.round(el.elementInfo.boundingBox.x),
          y: Math.round(el.elementInfo.boundingBox.y),
          width: Math.round(el.elementInfo.boundingBox.width),
          height: Math.round(el.elementInfo.boundingBox.height)
        },
        styles: {
          display: el.elementInfo.computedStyles.display,
          color: el.elementInfo.computedStyles.color,
          backgroundColor: el.elementInfo.computedStyles.backgroundColor,
          fontSize: el.elementInfo.computedStyles.fontSize,
          fontWeight: el.elementInfo.computedStyles.fontWeight
        }
      }))
    }
    
    this.outputArea.value = JSON.stringify(output, null, 2)
  }
}