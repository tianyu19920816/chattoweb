export interface ElementPointer {
  selector: string
  text?: string
  label?: string
  position?: string
}

export interface ElementStyles {
  display: string
  position: string
  width: string
  height: string
  margin: string
  padding: string
  color: string
  backgroundColor: string
  fontSize: string
  fontWeight: string
  border: string
  borderRadius: string
  boxShadow?: string
  opacity: string
  zIndex: string
}

/**
 * 提取元素的指向性信息（精简版）
 * 目标：让AI准确知道用户指的是哪个元素
 */
export function extractPointerInfo(element: Element): ElementPointer {
  const result: ElementPointer = {
    selector: ''
  }
  
  // 1. 生成最短的唯一选择器
  if (element.id) {
    result.selector = `#${element.id}`
  } else {
    // 尝试使用class + 索引
    const className = typeof element.className === 'string' && element.className ? `.${element.className.split(' ')[0]}` : ''
    const tag = element.tagName.toLowerCase()
    
    if (className) {
      const similar = document.querySelectorAll(`${tag}${className}`)
      if (similar.length === 1) {
        result.selector = `${tag}${className}`
      } else {
        const index = Array.from(similar).indexOf(element)
        result.selector = `${tag}${className}:nth-of-type(${index + 1})`
      }
    } else {
      // 使用父元素 + 子元素索引
      const parent = element.parentElement
      if (parent) {
        const parentSelector = parent.id ? `#${parent.id}` : parent.tagName.toLowerCase()
        const index = Array.from(parent.children).indexOf(element)
        result.selector = `${parentSelector} > ${tag}:nth-child(${index + 1})`
      } else {
        result.selector = tag
      }
    }
  }
  
  // 2. 提取关键文本内容（限制长度）
  const text = element.textContent?.trim()
  if (text && text.length <= 50) {
    result.text = text
  } else if (text) {
    result.text = text.substring(0, 47) + '...'
  }
  
  // 3. 查找关联的label（表单元素）
  if (element instanceof HTMLInputElement || 
      element instanceof HTMLSelectElement || 
      element instanceof HTMLTextAreaElement) {
    const labelElement = document.querySelector(`label[for="${element.id}"]`)
    if (labelElement) {
      result.label = labelElement.textContent?.trim()
    } else {
      // 查找包含此元素的label
      const parentLabel = element.closest('label')
      if (parentLabel) {
        result.label = parentLabel.textContent?.trim()
      }
    }
  }
  
  // 4. 添加位置描述（用于辅助定位）
  const rect = element.getBoundingClientRect()
  result.position = `${Math.round(rect.left)},${Math.round(rect.top)}`
  
  return result
}

/**
 * 提取元素的样式信息（主要样式）
 * 目标：用于参考和仿造
 */
export function extractStyleInfo(element: Element): ElementStyles {
  const computed = window.getComputedStyle(element)
  
  // 提取主要样式属性
  return {
    display: computed.display,
    position: computed.position,
    width: computed.width,
    height: computed.height,
    margin: computed.margin,
    padding: computed.padding,
    color: computed.color,
    backgroundColor: computed.backgroundColor,
    fontSize: computed.fontSize,
    fontWeight: computed.fontWeight,
    border: computed.border,
    borderRadius: computed.borderRadius,
    boxShadow: computed.boxShadow !== 'none' ? computed.boxShadow : undefined,
    opacity: computed.opacity,
    zIndex: computed.zIndex
  }
}

/**
 * 格式化指向性信息为简短文本
 */
export function formatPointerInfo(info: ElementPointer): string {
  const lines = [`元素: ${info.selector}`]
  
  if (info.text) {
    lines.push(`文本: "${info.text}"`)
  }
  
  if (info.label) {
    lines.push(`标签: "${info.label}"`)
  }
  
  lines.push(`位置: (${info.position})`)
  
  return lines.join('\n')
}

/**
 * 格式化样式信息为CSS文本
 */
export function formatStyleInfo(styles: ElementStyles): string {
  const lines = []
  
  for (const [key, value] of Object.entries(styles)) {
    if (value !== undefined && value !== '' && value !== 'none' && value !== 'normal' && value !== 'auto') {
      // 转换驼峰为kebab-case
      const cssKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
      lines.push(`${cssKey}: ${value};`)
    }
  }
  
  return lines.join('\n')
}