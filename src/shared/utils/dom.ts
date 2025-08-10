export function getXPath(element: Element): string {
  if (!element) return ''
  
  const paths: string[] = []
  
  for (let current = element; current && current.nodeType === Node.ELEMENT_NODE; current = current.parentElement!) {
    let index = 0
    let hasFollowingSiblings = false
    
    for (let sibling = current.previousSibling; sibling; sibling = sibling.previousSibling) {
      if (sibling.nodeType === Node.DOCUMENT_TYPE_NODE) continue
      if (sibling.nodeName === current.nodeName) ++index
    }
    
    for (let sibling = current.nextSibling; sibling && !hasFollowingSiblings; sibling = sibling.nextSibling) {
      if (sibling.nodeName === current.nodeName) hasFollowingSiblings = true
    }
    
    const tagName = current.nodeName.toLowerCase()
    const pathIndex = index || hasFollowingSiblings ? `[${index + 1}]` : ''
    paths.unshift(`${tagName}${pathIndex}`)
  }
  
  return paths.length ? `/${paths.join('/')}` : ''
}

export function getCSSSelector(element: Element): string {
  if (!element) return ''
  
  const path: string[] = []
  
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase()
    
    if (element.id) {
      selector = `#${element.id}`
      path.unshift(selector)
      break
    } else {
      let sibling = element
      let nth = 1
      
      while (sibling.previousElementSibling) {
        sibling = sibling.previousElementSibling
        if (sibling.nodeName.toLowerCase() === selector) nth++
      }
      
      if (nth !== 1) selector += `:nth-of-type(${nth})`
    }
    
    path.unshift(selector)
    element = element.parentElement!
  }
  
  return path.join(' > ')
}

export function getParentChain(element: Element): string[] {
  const chain: string[] = []
  let current = element.parentElement
  
  while (current && current !== document.body) {
    const descriptor = current.tagName.toLowerCase() + 
      (current.id ? `#${current.id}` : '') +
      (typeof current.className === 'string' && current.className ? `.${current.className.split(' ').join('.')}` : '')
    chain.push(descriptor)
    current = current.parentElement
  }
  
  return chain
}

import { ElementInfo } from '../types'

export function getElementInfo(element: Element): Omit<ElementInfo, 'id'> {
  const rect = element.getBoundingClientRect()
  const computedStyles = window.getComputedStyle(element)
  
  const attributes: Record<string, string> = {}
  for (const attr of element.attributes) {
    attributes[attr.name] = attr.value
  }
  
  const importantStyles: (keyof CSSStyleDeclaration)[] = [
    'display', 'position', 'width', 'height', 'padding', 'margin',
    'color', 'backgroundColor', 'fontSize', 'fontFamily', 'fontWeight',
    'border', 'borderRadius', 'boxShadow', 'opacity', 'zIndex'
  ]
  
  const styles: any = {}
  importantStyles.forEach(prop => {
    styles[prop] = computedStyles[prop as any]
  })
  
  return {
    tagName: element.tagName.toLowerCase(),
    className: typeof element.className === 'string' ? element.className : '',
    idAttribute: element.id || '',
    text: (element as HTMLElement).innerText || element.textContent || '',
    html: element.innerHTML,
    attributes,
    computedStyles: styles,
    position: rect.toJSON(),
    boundingBox: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    },
    xpath: getXPath(element),
    cssSelector: getCSSSelector(element),
    parentChain: getParentChain(element),
    children: element.children.length
  }
}

export function isInteractiveElement(element: Element): boolean {
  const tagName = element.tagName.toLowerCase()
  const interactiveTags = ['a', 'button', 'input', 'select', 'textarea', 'label']
  return interactiveTags.includes(tagName) || element.hasAttribute('onclick')
}

export function findSimilarElements(element: Element): Element[] {
  const similar: Element[] = []
  const tagName = element.tagName
  const className = typeof element.className === 'string' ? element.className : ''
  
  const candidates = document.querySelectorAll(tagName + (className ? `.${className.split(' ').join('.')}` : ''))
  
  candidates.forEach(candidate => {
    if (candidate !== element && areSimilar(element, candidate)) {
      similar.push(candidate)
    }
  })
  
  return similar
}

function areSimilar(el1: Element, el2: Element): boolean {
  if (el1.tagName !== el2.tagName) return false
  const className1 = typeof el1.className === 'string' ? el1.className : ''
  const className2 = typeof el2.className === 'string' ? el2.className : ''
  if (className1 !== className2) return false
  
  const parent1 = el1.parentElement
  const parent2 = el2.parentElement
  
  if (parent1 && parent2) {
    if (parent1.tagName !== parent2.tagName) return false
    const parentClassName1 = typeof parent1.className === 'string' ? parent1.className : ''
    const parentClassName2 = typeof parent2.className === 'string' ? parent2.className : ''
    if (parentClassName1 !== parentClassName2) return false
  }
  
  return true
}