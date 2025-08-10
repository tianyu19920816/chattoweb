export class OverlayManager {
  private overlayContainer: HTMLDivElement | null = null
  private selectedElements: Map<string, HTMLDivElement> = new Map()
  private labels: Map<string, HTMLDivElement> = new Map()
  private elementIndexMap: Map<string, number> = new Map()

  constructor() {
    this.createOverlayContainer()
  }
  
  getElementIndex(id: string): number | undefined {
    return this.elementIndexMap.get(id)
  }

  show() {
    if (this.overlayContainer) {
      this.overlayContainer.style.display = 'block'
    }
  }

  hide() {
    if (this.overlayContainer) {
      this.overlayContainer.style.display = 'none'
    }
  }

  addSelectedElement(element: Element, id: string) {
    const overlay = this.createElementOverlay(element, id)
    this.selectedElements.set(id, overlay)
    
    const label = this.createElementLabel(element, this.selectedElements.size)
    this.labels.set(id, label)
  }

  removeSelectedElement(id: string) {
    const overlay = this.selectedElements.get(id)
    if (overlay) {
      overlay.remove()
      this.selectedElements.delete(id)
    }

    const label = this.labels.get(id)
    if (label) {
      label.remove()
      this.labels.delete(id)
    }

    this.updateLabels()
  }

  clearAllSelections() {
    this.selectedElements.forEach(overlay => overlay.remove())
    this.selectedElements.clear()
    
    this.labels.forEach(label => label.remove())
    this.labels.clear()
  }

  private createOverlayContainer() {
    this.overlayContainer = document.createElement('div')
    this.overlayContainer.id = 'web-extractor-overlay-container'
    this.overlayContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999997;
      display: none;
    `
    document.body.appendChild(this.overlayContainer)
  }

  private createElementOverlay(element: Element, id: string): HTMLDivElement {
    const overlay = document.createElement('div')
    overlay.className = 'web-extractor-selected'
    overlay.dataset.elementId = id
    
    const rect = element.getBoundingClientRect()
    overlay.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 3px solid rgba(239, 68, 68, 0.9);
      background: rgba(239, 68, 68, 0.1);
      pointer-events: none;
      z-index: 999997;
      animation: pulse-border 2s infinite;
    `
    
    if (this.overlayContainer) {
      this.overlayContainer.appendChild(overlay)
    }
    
    // 不再添加删除按钮，点击选框即可删除
    
    return overlay
  }

  private createElementLabel(element: Element, index: number): HTMLDivElement {
    const label = document.createElement('div')
    label.className = 'web-extractor-label'
    label.dataset.elementIndex = index.toString()
    
    const rect = element.getBoundingClientRect()
    const tagName = element.tagName.toLowerCase()
    const className = typeof element.className === 'string' && element.className ? `.${element.className.split(' ')[0]}` : ''
    const id = element.id ? `#${element.id}` : ''
    const elementInfo = `${tagName}${id || className || ''}`
    
    // 保存元素信息以便hover时使用
    label.dataset.elementInfo = elementInfo
    
    label.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top - 28}px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
      pointer-events: none;
      z-index: 999998;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      white-space: nowrap;
      transition: all 0.2s ease;
    `
    
    // 默认只显示编号
    label.textContent = `#${index}`
    
    if (this.overlayContainer) {
      this.overlayContainer.appendChild(label)
    }
    
    // 添加hover效果显示元素信息
    this.setupLabelHover(label, elementInfo, index)
    
    return label
  }
  
  private setupLabelHover(label: HTMLDivElement, elementInfo: string, index: number) {
    const overlayId = Array.from(this.labels.entries()).find(([_, l]) => l === label)?.[0]
    if (!overlayId) return
    
    const overlay = this.selectedElements.get(overlayId)
    if (!overlay) return
    
    const showInfo = () => {
      label.innerHTML = `
        <span style="margin-right: 6px;">#${index}</span>
        <span style="opacity: 0.9;">${elementInfo}</span>
      `
    }
    
    const hideInfo = () => {
      label.textContent = `#${index}`
    }
    
    // 监听鼠标移动，检查是否在选框内
    const checkHover = (e: MouseEvent) => {
      const rect = overlay.getBoundingClientRect()
      const isInside = e.clientX >= rect.left && e.clientX <= rect.right &&
                       e.clientY >= rect.top && e.clientY <= rect.bottom
      if (isInside) {
        showInfo()
      } else {
        hideInfo()
      }
    }
    
    document.addEventListener('mousemove', checkHover)
    
    // 清理事件监听
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.removedNodes.length > 0) {
          mutation.removedNodes.forEach((node) => {
            if (node === label || node === overlay) {
              document.removeEventListener('mousemove', checkHover)
              observer.disconnect()
            }
          })
        }
      })
    })
    
    if (label.parentNode) {
      observer.observe(label.parentNode, { childList: true })
    }
  }



  private updateLabels() {
    // 重新编号所有标签
    let index = 1
    this.selectedElements.forEach((_, id) => {
      const label = this.labels.get(id)
      if (label) {
        const elementInfo = label.dataset.elementInfo || ''
        // 默认只显示编号
        label.textContent = `#${index}`
        // 重新设置hover效果
        this.setupLabelHover(label, elementInfo, index)
        this.elementIndexMap.set(id, index)
        index++
      }
    })
  }

  updatePositions() {
    this.selectedElements.forEach((overlay, id) => {
      const selector = overlay.dataset.selector
      if (selector) {
        const element = document.querySelector(selector)
        if (element) {
          const rect = element.getBoundingClientRect()
          overlay.style.left = `${rect.left}px`
          overlay.style.top = `${rect.top}px`
          overlay.style.width = `${rect.width}px`
          overlay.style.height = `${rect.height}px`

          const label = this.labels.get(id)
          if (label) {
            label.style.left = `${rect.left}px`
            label.style.top = `${rect.top - 25}px`
          }
        }
      }
    })
  }
}