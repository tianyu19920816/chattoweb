import { SelectedElement } from '../shared/types'

export class FloatingPanel {
  private container: HTMLDivElement
  private isVisible = false
  private isDragging = false
  private dragOffset = { x: 0, y: 0 }
  private currentPos = { x: 0, y: 0 }
  
  constructor() {
    this.container = document.createElement('div')
    this.container.id = 'web-extractor-floating-panel'
    this.init()
  }
  
  private init() {
    this.createStyles()
    this.createPanel()
    
    // 确保容器被添加到页面
    if (!document.body.contains(this.container)) {
      document.body.appendChild(this.container)
    }
  }
  
  private createStyles() {
    // 检查是否已经添加了样式
    if (document.getElementById('web-extractor-panel-styles')) {
      return
    }
    
    const style = document.createElement('style')
    style.id = 'web-extractor-panel-styles'
    style.textContent = `
      #web-extractor-floating-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        max-height: 650px;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 2147483647;
        display: none;
        flex-direction: column;
        pointer-events: auto !important;
      }
      
      #web-extractor-floating-panel * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      #web-extractor-floating-panel.visible {
        display: flex !important;
      }
      
      #web-extractor-floating-panel .wex-header {
        padding: 14px 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px 12px 0 0;
        cursor: move;
        user-select: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      #web-extractor-floating-panel .wex-header:active {
        cursor: grabbing;
      }
      
      #web-extractor-floating-panel .wex-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 15px;
        font-weight: 600;
      }
      
      #web-extractor-floating-panel .wex-close {
        width: 28px;
        height: 28px;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 6px;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      
      #web-extractor-floating-panel .wex-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }
      
      #web-extractor-floating-panel .wex-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 16px;
        background: #ffffff;
      }
      
      #web-extractor-floating-panel .wex-modes {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-bottom: 16px;
      }
      
      #web-extractor-floating-panel .wex-btn {
        padding: 10px 8px;
        border: 2px solid #e5e7eb;
        background: #ffffff;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        color: #374151;
        transition: all 0.2s;
        text-align: center;
      }
      
      #web-extractor-floating-panel .wex-btn:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
      }
      
      #web-extractor-floating-panel .wex-btn.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
        box-shadow: 0 2px 4px rgba(102, 126, 234, 0.4);
      }
      
      #web-extractor-floating-panel .wex-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 16px;
      }
      
      #web-extractor-floating-panel .wex-action-btn {
        padding: 12px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s;
        color: white;
      }
      
      #web-extractor-floating-panel .wex-start {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      #web-extractor-floating-panel .wex-start:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      
      #web-extractor-floating-panel .wex-clear {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      }
      
      #web-extractor-floating-panel .wex-clear:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
      }
      
      #web-extractor-floating-panel .wex-section-title {
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      #web-extractor-floating-panel .wex-elements {
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        max-height: 180px;
        overflow-y: auto;
        margin-bottom: 16px;
        background: #f9fafb;
      }
      
      #web-extractor-floating-panel .wex-elements::-webkit-scrollbar {
        width: 6px;
      }
      
      #web-extractor-floating-panel .wex-elements::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }
      
      #web-extractor-floating-panel .wex-elements::-webkit-scrollbar-thumb {
        background: #9ca3af;
        border-radius: 3px;
      }
      
      #web-extractor-floating-panel .wex-elements::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
      }
      
      #web-extractor-floating-panel .wex-element {
        padding: 10px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        margin-bottom: 8px;
        font-size: 13px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.2s;
      }
      
      #web-extractor-floating-panel .wex-element:last-child {
        margin-bottom: 0;
      }
      
      #web-extractor-floating-panel .wex-element:hover {
        border-color: #9ca3af;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
      
      #web-extractor-floating-panel .wex-element-info {
        flex: 1;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      #web-extractor-floating-panel .wex-element-tag {
        color: #667eea;
        font-weight: 600;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 12px;
      }
      
      #web-extractor-floating-panel .wex-element-text {
        color: #6b7280;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 12px;
      }
      
      #web-extractor-floating-panel .wex-element-actions {
        display: flex;
        gap: 6px;
      }
      
      #web-extractor-floating-panel .wex-copy-btn,
      #web-extractor-floating-panel .wex-remove-btn {
        width: 24px;
        height: 24px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      
      #web-extractor-floating-panel .wex-copy-btn {
        background: #10b981;
        color: white;
      }
      
      #web-extractor-floating-panel .wex-copy-btn:hover {
        background: #059669;
        transform: scale(1.1);
      }
      
      #web-extractor-floating-panel .wex-remove-btn {
        background: #ef4444;
        color: white;
      }
      
      #web-extractor-floating-panel .wex-remove-btn:hover {
        background: #dc2626;
        transform: scale(1.1);
      }
      
      #web-extractor-floating-panel .wex-empty {
        text-align: center;
        color: #9ca3af;
        font-size: 13px;
        padding: 20px;
      }
      
      #web-extractor-floating-panel .wex-output {
        flex: 1;
        padding: 12px;
        background: #1e293b;
        color: #e2e8f0;
        border: none;
        border-radius: 8px;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.5;
        resize: none;
        min-height: 120px;
        margin-bottom: 12px;
      }
      
      #web-extractor-floating-panel .wex-output::-webkit-scrollbar {
        width: 6px;
      }
      
      #web-extractor-floating-panel .wex-output::-webkit-scrollbar-track {
        background: #334155;
        border-radius: 3px;
      }
      
      #web-extractor-floating-panel .wex-output::-webkit-scrollbar-thumb {
        background: #64748b;
        border-radius: 3px;
      }
      
      #web-extractor-floating-panel .wex-copy-all {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      #web-extractor-floating-panel .wex-copy-all:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      }
      
      #web-extractor-floating-panel .wex-copy-all.copied {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
      }
      
      #web-extractor-floating-panel .wex-footer {
        padding: 12px 16px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        border-radius: 0 0 12px 12px;
        font-size: 11px;
        color: #6b7280;
        text-align: center;
      }
      
      #web-extractor-floating-panel .wex-shortcut {
        background: #e5e7eb;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 10px;
        color: #374151;
        margin: 0 2px;
      }
    `
    document.head.appendChild(style)
  }
  
  private createPanel() {
    this.container.innerHTML = `
      <div class="wex-header" id="wex-header">
        <div class="wex-title">
          <span>🎯</span>
          <span>元素提取器</span>
        </div>
        <button class="wex-close" id="wex-close">×</button>
      </div>
      
      <div class="wex-body">
        <div class="wex-modes">
          <button class="wex-btn" data-mode="single">单选</button>
          <button class="wex-btn active" data-mode="multiple">多选</button>
          <button class="wex-btn" data-mode="area">区域选择</button>
          <button class="wex-btn" data-mode="smart">相似元素</button>
        </div>
        
        <div class="wex-actions">
          <button class="wex-action-btn wex-start" id="wex-start">开始选择</button>
          <button class="wex-action-btn wex-clear" id="wex-clear">清除全部</button>
        </div>
        
        <div class="wex-section-title">已选择元素 (<span id="wex-count">0</span>)</div>
        <div class="wex-elements" id="wex-elements">
          <div class="wex-empty">暂无选中元素</div>
        </div>
        
        <div class="wex-section-title">输出数据</div>
        <textarea class="wex-output" id="wex-output" readonly placeholder="选择元素后，这里将显示提取的数据"></textarea>
        
        <button class="wex-copy-all" id="wex-copy">复制所有</button>
      </div>
      
      <div class="wex-footer">
        快捷键: <span class="wex-shortcut">Delete/Backspace</span> 删除最后选择 | <span class="wex-shortcut">Esc</span> 清除所有
      </div>
    `
    
    this.attachEventListeners()
    this.setupDragAndDrop()
  }
  
  private setupDragAndDrop() {
    const header = this.container.querySelector('#wex-header') as HTMLElement
    if (!header) return
    
    header.addEventListener('mousedown', (e) => {
      // 不要在点击关闭按钮时触发拖动
      if ((e.target as HTMLElement).id === 'wex-close') return
      
      this.isDragging = true
      const rect = this.container.getBoundingClientRect()
      this.dragOffset.x = e.clientX - rect.left
      this.dragOffset.y = e.clientY - rect.top
      
      // 防止选中文本
      e.preventDefault()
    })
    
    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return
      
      const x = e.clientX - this.dragOffset.x
      const y = e.clientY - this.dragOffset.y
      
      // 限制在视窗内
      const maxX = window.innerWidth - this.container.offsetWidth
      const maxY = window.innerHeight - this.container.offsetHeight
      
      this.currentPos.x = Math.max(0, Math.min(x, maxX))
      this.currentPos.y = Math.max(0, Math.min(y, maxY))
      
      this.container.style.left = `${this.currentPos.x}px`
      this.container.style.top = `${this.currentPos.y}px`
      this.container.style.right = 'auto'
    })
    
    document.addEventListener('mouseup', () => {
      this.isDragging = false
    })
  }
  
  private attachEventListeners() {
    // 关闭按钮
    const closeBtn = this.container.querySelector('#wex-close')
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      this.hide()
    })
    
    // 开始选择按钮
    const startBtn = this.container.querySelector('#wex-start')
    startBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      console.log('Start button clicked')
      chrome.runtime.sendMessage({
        type: 'TOGGLE_SELECTION',
        from: 'panel'
      }, (response) => {
        console.log('Toggle selection response:', response)
      })
    })
    
    // 清除按钮
    const clearBtn = this.container.querySelector('#wex-clear')
    clearBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      console.log('Clear button clicked')
      chrome.runtime.sendMessage({
        type: 'CLEAR_SELECTION',
        from: 'panel'
      }, (response) => {
        console.log('Clear selection response:', response)
      })
      this.updateElements([])
    })
    
    // 复制按钮
    const copyBtn = this.container.querySelector('#wex-copy')
    copyBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      const output = this.container.querySelector('#wex-output') as HTMLTextAreaElement
      if (output?.value) {
        navigator.clipboard.writeText(output.value).then(() => {
          if (copyBtn) {
            copyBtn.textContent = '✓ 已复制!'
            copyBtn.classList.add('copied')
            setTimeout(() => {
              copyBtn.textContent = '复制所有'
              copyBtn.classList.remove('copied')
            }, 2000)
          }
        })
      }
    })
    
    // 模式切换
    this.container.querySelectorAll('.wex-btn[data-mode]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const target = e.currentTarget as HTMLElement
        const mode = target.getAttribute('data-mode')
        console.log('Mode button clicked:', mode)
        
        if (mode) {
          // 更新按钮状态
          this.container.querySelectorAll('.wex-btn[data-mode]').forEach(b => {
            b.classList.remove('active')
          })
          target.classList.add('active')
          
          // 发送模式变更消息
          chrome.runtime.sendMessage({
            type: 'SET_MODE',
            from: 'panel',
            payload: { mode }
          }, (response) => {
            console.log('Set mode response:', response)
          })
        }
      })
    })
  }
  
  show() {
    console.log('FloatingPanel.show() called')
    this.isVisible = true
    this.container.classList.add('visible')
  }
  
  hide() {
    console.log('FloatingPanel.hide() called')
    this.isVisible = false
    this.container.classList.remove('visible')
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
    const startBtn = this.container.querySelector('#wex-start')
    if (startBtn) {
      startBtn.textContent = isActive ? '停止选择' : '开始选择'
    }
  }
  
  updateElements(elements: SelectedElement[]) {
    const container = this.container.querySelector('#wex-elements')
    const output = this.container.querySelector('#wex-output') as HTMLTextAreaElement
    const count = this.container.querySelector('#wex-count')
    
    if (count) {
      count.textContent = elements.length.toString()
    }
    
    if (!container) return
    
    if (elements.length === 0) {
      container.innerHTML = '<div class="wex-empty">暂无选中元素</div>'
      if (output) output.value = ''
    } else {
      container.innerHTML = elements.map((el, index) => `
        <div class="wex-element">
          <div class="wex-element-info">
            <span style="
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: bold;
              margin-right: 8px;
            ">#${index + 1}</span>
            <span class="wex-element-tag">&lt;${el.elementInfo.tagName.toLowerCase()}&gt;</span>
            <span class="wex-element-text">${el.elementInfo.text?.substring(0, 50) || el.elementInfo.className || el.elementInfo.idAttribute || ''}</span>
          </div>
          <div class="wex-element-actions">
            <button class="wex-copy-btn" data-id="${el.id}">📋</button>
            <button class="wex-remove-btn" data-id="${el.id}">×</button>
          </div>
        </div>
      `).join('')
      
      // 添加复制单个元素事件
      container.querySelectorAll('.wex-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const id = (btn as HTMLElement).getAttribute('data-id')
          const element = elements.find(el => el.id === id)
          if (element) {
            // 使用与批量复制相同的精简格式
            const attrs = element.elementInfo.attributes
            const box = element.elementInfo.boundingBox
            const elementData: any = {
              page: {
                url: window.location.href,
                title: document.title
              },
              element: {
                tag: element.elementInfo.tagName.toLowerCase(),
                selector: element.elementInfo.cssSelector,
                xpath: element.elementInfo.xpath
              }
            }
            
            // 动态添加有意义的字段
            if (element.elementInfo.idAttribute) {
              elementData.element.id = element.elementInfo.idAttribute
            }
            if (element.elementInfo.className) {
              elementData.element.class = element.elementInfo.className
            }
            if (element.elementInfo.text?.trim()) {
              elementData.element.text = element.elementInfo.text.trim().substring(0, 50)
            }
            
            // 添加子元素数量
            if (element.elementInfo.children > 0) {
              elementData.element.children = element.elementInfo.children
            }
            
            // 关键属性
            const keyAttrs: Record<string, string> = {}
            const importantAttrs = ['href', 'src', 'alt', 'placeholder', 'value', 'type', 'role', 'contenteditable']
            Object.entries(attrs).forEach(([key, val]) => {
              if (key.startsWith('data-') || key.startsWith('aria-') || importantAttrs.includes(key.toLowerCase())) {
                keyAttrs[key] = val
              }
            })
            if (Object.keys(keyAttrs).length > 0) {
              elementData.element.attrs = keyAttrs
            }
            
            // 位置和父元素
            elementData.element.pos = [Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height)]
            
            const parentPath = element.elementInfo.parentChain.slice(0, 2).map(p => {
              const match = p.match(/^(\w+)(?:\.([\w-]+))?/)
              return match ? (match[2] || match[1]) : p.split('.')[0]
            })
            if (parentPath.length > 0) {
              elementData.element.parent = parentPath
            }
            
            // 元素类型
            const tagName = element.elementInfo.tagName
            let elementType: string | undefined
            
            if (tagName === 'A') {
              elementType = 'link'
            } else if (tagName === 'BUTTON') {
              elementType = 'button'
            } else if (tagName === 'INPUT') {
              const inputType = attrs['type'] || 'text'
              elementType = `input-${inputType}`
            } else if (tagName === 'SELECT') {
              elementType = 'select'
            } else if (tagName === 'TEXTAREA') {
              elementType = 'textarea'
            } else if (tagName === 'IMG') {
              elementType = 'image'
            } else if (attrs['contenteditable'] === 'true') {
              elementType = 'editable'
            } else if (attrs['role'] === 'button' || attrs['role'] === 'link') {
              elementType = `role-${attrs['role']}`
            } else if ((tagName === 'DIV' || tagName === 'SECTION' || tagName === 'ARTICLE' || tagName === 'MAIN') && element.elementInfo.children > 0) {
              elementType = 'container'
            }
            
            if (elementType) {
              elementData.element.type = elementType
            }
            navigator.clipboard.writeText(JSON.stringify(elementData, null, 2)).then(() => {
              const originalText = btn.textContent
              btn.textContent = '✓'
              setTimeout(() => {
                btn.textContent = originalText
              }, 1500)
            })
          }
        })
      })
      
      // 添加删除单个元素事件
      container.querySelectorAll('.wex-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const id = (btn as HTMLElement).getAttribute('data-id')
          if (id) {
            chrome.runtime.sendMessage({
              type: 'REMOVE_ELEMENT',
              from: 'panel',
              payload: { id }
            })
          }
        })
      })
      
      // 更新输出 - 优化为精简且全面的格式
      if (output) {
        const outputData = {
          page: {
            url: window.location.href,
            title: document.title
          },
          elements: elements.map((el) => {
            // 提取关键属性
            const attrs = el.elementInfo.attributes
            const styles = el.elementInfo.computedStyles
            const box = el.elementInfo.boundingBox
            
            // 构建精简的数据结构
            const elementData: any = {
              tag: el.elementInfo.tagName.toLowerCase(),
              selector: el.elementInfo.cssSelector,
              xpath: el.elementInfo.xpath
            }
            
            // 只在有意义时添加ID和class
            if (el.elementInfo.idAttribute) {
              elementData.id = el.elementInfo.idAttribute
            }
            if (el.elementInfo.className) {
              elementData.class = el.elementInfo.className
            }
            
            // 只添加非空文本（前50字符）
            if (el.elementInfo.text?.trim()) {
              elementData.text = el.elementInfo.text.trim().substring(0, 50)
            }
            
            // 添加子元素数量（当没有文本但有子元素时特别有用）
            if (el.elementInfo.children > 0) {
              elementData.children = el.elementInfo.children
            }
            
            // 只添加关键属性（data-*, aria-*, role, href, src, placeholder等）
            const keyAttrs: Record<string, string> = {}
            const importantAttrs = ['href', 'src', 'alt', 'title', 'placeholder', 'value', 'type', 'name', 'role', 'contenteditable']
            
            Object.entries(attrs).forEach(([key, val]) => {
              if (key.startsWith('data-') || key.startsWith('aria-') || importantAttrs.includes(key.toLowerCase())) {
                keyAttrs[key] = val
              }
            })
            
            if (Object.keys(keyAttrs).length > 0) {
              elementData.attrs = keyAttrs
            }
            
            // 位置信息（简化）
            elementData.pos = [
              Math.round(box.x),
              Math.round(box.y),
              Math.round(box.width),
              Math.round(box.height)
            ]
            
            // 父元素路径（只保留最重要的类名）
            const parentPath = el.elementInfo.parentChain.slice(0, 2).map(p => {
              // 提取最重要的类名或标签
              const match = p.match(/^(\w+)(?:\.([\w-]+))?/)
              return match ? (match[2] || match[1]) : p.split('.')[0]
            })
            if (parentPath.length > 0) {
              elementData.parent = parentPath
            }
            
            // 关键样式（只在特殊情况下添加）
            const keyStyles: Record<string, string> = {}
            if (styles.display === 'none' || styles.visibility === 'hidden') {
              keyStyles.hidden = 'true'
            }
            if (styles.opacity && parseFloat(styles.opacity) < 1) {
              keyStyles.opacity = styles.opacity
            }
            if (styles.position && styles.position !== 'static') {
              keyStyles.position = styles.position
            }
            
            if (Object.keys(keyStyles).length > 0) {
              elementData.style = keyStyles
            }
            
            // 元素类型和交互性标记
            const tagName = el.elementInfo.tagName
            let elementType: string | undefined
            
            // 判断元素类型
            if (tagName === 'A') {
              elementType = 'link'
            } else if (tagName === 'BUTTON') {
              elementType = 'button'
            } else if (tagName === 'INPUT') {
              const inputType = attrs['type'] || 'text'
              elementType = `input-${inputType}`
            } else if (tagName === 'SELECT') {
              elementType = 'select'
            } else if (tagName === 'TEXTAREA') {
              elementType = 'textarea'
            } else if (tagName === 'LABEL') {
              elementType = 'label'
            } else if (tagName === 'IMG') {
              elementType = 'image'
            } else if (tagName === 'VIDEO') {
              elementType = 'video'
            } else if (tagName === 'FORM') {
              elementType = 'form'
            } else if (attrs['contenteditable'] === 'true') {
              elementType = 'editable'
            } else if (attrs['role'] === 'button' || attrs['role'] === 'link' || attrs['role'] === 'tab') {
              elementType = `role-${attrs['role']}`
            } else if (el.elementInfo.eventListeners?.includes('click')) {
              elementType = 'clickable'
            } else if ((tagName === 'DIV' || tagName === 'SECTION' || tagName === 'ARTICLE' || tagName === 'MAIN' || tagName === 'ASIDE' || tagName === 'NAV' || tagName === 'HEADER' || tagName === 'FOOTER') && el.elementInfo.children > 0) {
              // 标识容器类元素
              elementType = 'container'
            }
            
            if (elementType) {
              elementData.type = elementType
            }
            
            return elementData
          })
        }
        
        output.value = JSON.stringify(outputData, null, 2)
      }
    }
  }
}