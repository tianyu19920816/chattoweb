export interface ElementInfo {
  id: string
  tagName: string
  className: string
  idAttribute: string
  text: string
  html: string
  attributes: Record<string, string>
  computedStyles: Partial<CSSStyleDeclaration>
  position: DOMRect
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  xpath: string
  cssSelector: string
  parentChain: string[]
  children: number
  eventListeners?: string[]
}

export interface SelectedElement {
  id: string
  elementInfo: ElementInfo
  timestamp: number
  note?: string
}

export type SelectionMode = 'single' | 'multiple' | 'area' | 'smart'

export type OutputFormat = 'json' | 'xml' | 'markdown' | 'custom'

export interface Template {
  id: string
  name: string
  description: string
  format: OutputFormat
  template: string
  variables: string[]
  isBuiltIn: boolean
}

export interface ExtractorState {
  isActive: boolean
  mode: SelectionMode
  selectedElements: SelectedElement[]
  hoveredElement: ElementInfo | null
  outputFormat: OutputFormat
  selectedTemplate: string
  templates: Template[]
  settings: ExtractorSettings
}

export interface ExtractorSettings {
  highlightColor: string
  selectedColor: string
  opacity: number
  showLabels: boolean
  autoScroll: boolean
  captureEventListeners: boolean
  maxElements: number
}

export type MessageType = 
  | 'ACTIVATE_SELECTION'
  | 'DEACTIVATE_SELECTION'
  | 'SET_MODE'
  | 'ELEMENT_SELECTED'
  | 'ELEMENT_DESELECTED'
  | 'CLEAR_SELECTION'
  | 'GENERATE_PROMPT'
  | 'COPY_TO_CLIPBOARD'
  | 'UPDATE_SETTINGS'
  | 'GET_STATE'
  | 'STATE_UPDATE'
  | 'TOGGLE_PANEL'
  | 'TOGGLE_SELECTION'
  | 'REMOVE_ELEMENT'

export interface Message {
  type: MessageType
  payload?: any
}

export interface ChromeMessage extends Message {
  from: 'popup' | 'content' | 'background' | 'panel'
}