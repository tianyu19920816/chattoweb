import { ChromeMessage, ExtractorState, ExtractorSettings } from '../shared/types'
import { builtInTemplates } from '../shared/utils/templates'

class BackgroundService {
  private state: ExtractorState = {
    isActive: false,
    mode: 'multiple',
    selectedElements: [],
    hoveredElement: null,
    outputFormat: 'json',
    selectedTemplate: 'general-web-dev',
    templates: builtInTemplates,
    settings: this.getDefaultSettings()
  }

  constructor() {
    console.log('BackgroundService initializing...')
    this.initializeExtension()
    this.setupMessageListeners()
    this.setupContextMenu()
    this.setupCommands()
    this.setupActionClickHandler()
    console.log('BackgroundService initialized')
  }

  private getDefaultSettings(): ExtractorSettings {
    return {
      highlightColor: 'rgba(59, 130, 246, 0.2)',
      selectedColor: 'rgba(239, 68, 68, 0.9)',
      opacity: 0.2,
      showLabels: true,
      autoScroll: true,
      captureEventListeners: false,
      maxElements: 100
    }
  }

  private async initializeExtension() {
    const stored = await chrome.storage.local.get(['settings', 'templates'])
    
    if (stored.settings) {
      this.state.settings = { ...this.state.settings, ...stored.settings }
    }
    
    if (stored.templates) {
      this.state.templates = [...builtInTemplates, ...stored.templates]
    }

    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' })
  }

  private setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message: ChromeMessage, sender, sendResponse) => {
      console.log('Background received message:', message)

      switch (message.type) {
        case 'STATE_UPDATE':
          this.handleStateUpdate(message.payload)
          sendResponse({ success: true })
          break

        case 'ELEMENT_SELECTED':
          this.handleElementSelected(message.payload)
          sendResponse({ success: true })
          break

        case 'GET_STATE':
          sendResponse(this.state)
          break

        case 'UPDATE_SETTINGS':
          this.updateSettings(message.payload)
          sendResponse({ success: true })
          break

        case 'GENERATE_PROMPT':
          this.generatePrompt().then(prompt => {
            sendResponse({ success: true, prompt })
          })
          return true

        case 'COPY_TO_CLIPBOARD':
          this.copyToClipboard(message.payload.text)
          sendResponse({ success: true })
          break
        
        // 转发来自浮窗的消息给content script
        case 'TOGGLE_SELECTION':
        case 'SET_MODE':
        case 'CLEAR_SELECTION':
        case 'REMOVE_ELEMENT':
          // 转发给发送者所在的标签页
          if (sender.tab?.id) {
            chrome.tabs.sendMessage(sender.tab.id, message, sendResponse)
            return true
          }
          break

        default:
          sendResponse({ success: false, error: 'Unknown message type' })
      }

      return true
    })

    chrome.runtime.onConnect.addListener((port) => {
      console.log('Port connected:', port.name)
      
      port.onMessage.addListener((message) => {
        console.log('Port message:', message)
        this.broadcastToTabs(message)
      })
    })
  }

  private setupContextMenu() {
    // 先移除所有已存在的菜单项
    chrome.contextMenus.removeAll(() => {
      // 创建新的菜单项
      chrome.contextMenus.create({
        id: 'web-extractor-select',
        title: 'Extract Element',
        contexts: ['all']
      })

      chrome.contextMenus.create({
        id: 'web-extractor-select-similar',
        title: 'Extract Similar Elements',
        contexts: ['all']
      })
    })

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (!tab?.id) return

      switch (info.menuItemId) {
        case 'web-extractor-select':
          this.activateSelection(tab.id, 'multiple')
          break
        case 'web-extractor-select-similar':
          this.activateSelection(tab.id, 'smart')
          break
      }
    })
  }

  private setupCommands() {
    chrome.commands.onCommand.addListener((command) => {
      console.log('Command:', command)
      
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          if (command === 'toggle-selection') {
            this.toggleSelection(tabs[0].id)
          }
        }
      })
    })
  }

  private handleStateUpdate(payload: any) {
    this.state.isActive = payload.isActive
    this.state.mode = payload.mode
    this.state.selectedElements = payload.selectedElements || []
    
    this.updateBadge()
  }

  private handleElementSelected(element: any) {
    const exists = this.state.selectedElements.find(el => el.id === element.id)
    if (!exists) {
      this.state.selectedElements.push(element)
      this.updateBadge()
    }
  }

  private updateBadge() {
    const count = this.state.selectedElements.length
    
    if (this.state.isActive) {
      chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' })
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' })
    } else {
      chrome.action.setBadgeText({ text: '' })
    }
  }

  private async updateSettings(settings: Partial<ExtractorSettings>) {
    this.state.settings = { ...this.state.settings, ...settings }
    await chrome.storage.local.set({ settings: this.state.settings })
    this.broadcastToTabs({ type: 'UPDATE_SETTINGS', payload: this.state.settings })
  }

  private async generatePrompt(): Promise<string> {
    const { selectedElements, outputFormat, selectedTemplate, templates } = this.state
    
    if (selectedElements.length === 0) {
      return 'No elements selected'
    }

    const { generateJSON, generateXML, generateMarkdown, processTemplate } = await import('../shared/utils/templates')
    
    switch (outputFormat) {
      case 'json':
        return generateJSON(selectedElements)
      case 'xml':
        return generateXML(selectedElements)
      case 'markdown':
        return generateMarkdown(selectedElements)
      case 'custom':
        const template = templates.find(t => t.id === selectedTemplate)
        if (template) {
          return processTemplate(template, selectedElements)
        }
        return 'Template not found'
      default:
        return generateJSON(selectedElements)
    }
  }

  private async copyToClipboard(text: string) {
    try {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['CLIPBOARD' as chrome.offscreen.Reason],
        justification: 'Copy element data to clipboard'
      })

      await chrome.runtime.sendMessage({
        type: 'COPY_TEXT',
        target: 'offscreen',
        text
      })

      await chrome.offscreen.closeDocument()
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  private async activateSelection(tabId: number, mode: string) {
    await chrome.tabs.sendMessage(tabId, {
      type: 'ACTIVATE_SELECTION',
      payload: { mode }
    })
  }

  private async toggleSelection(tabId: number) {
    const response = await chrome.tabs.sendMessage(tabId, { type: 'GET_STATE' })
    
    if (response?.isActive) {
      await chrome.tabs.sendMessage(tabId, { type: 'DEACTIVATE_SELECTION' })
    } else {
      await chrome.tabs.sendMessage(tabId, { type: 'ACTIVATE_SELECTION' })
    }
  }

  private broadcastToTabs(message: any) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, message).catch(() => {})
        }
      })
    })
  }
  
  private setupActionClickHandler() {
    // 点击插件图标时显示浮窗
    console.log('Setting up action click handler')
    chrome.action.onClicked.addListener(async (tab) => {
      console.log('Action clicked for tab:', tab.id, tab.url)
      if (!tab.id || !tab.url) return
      
      // 检查是否是可以注入脚本的页面
      const url = tab.url
      const isRestrictedUrl = 
        url.startsWith('chrome://') ||
        url.startsWith('chrome-extension://') ||
        url.startsWith('edge://') ||
        url.startsWith('about:') ||
        url.startsWith('chrome-devtools://') ||
        url.startsWith('view-source:') ||
        url.startsWith('file://') && !url.includes('.html')
      
      if (isRestrictedUrl) {
        // 在受限页面上，显示提示
        console.warn('Cannot inject content script on restricted URL:', url)
        // 可以考虑显示一个通知
        chrome.action.setBadgeText({ text: '!', tabId: tab.id })
        chrome.action.setBadgeBackgroundColor({ color: '#FFA500', tabId: tab.id })
        setTimeout(() => {
          chrome.action.setBadgeText({ text: '', tabId: tab.id })
        }, 3000)
        return
      }
      
      try {
        // 尝试发送消息给content script
        await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PANEL' })
      } catch (error) {
        // 如果content script未注入，使用programmatic injection
        try {
          // 获取manifest中定义的content script
          const manifest = chrome.runtime.getManifest()
          const contentScripts = manifest.content_scripts?.[0]
          
          if (contentScripts?.js) {
            // 注入所有必要的脚本
            for (const script of contentScripts.js) {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: [script]
              })
            }
            
            // 注入CSS
            if (contentScripts.css) {
              for (const css of contentScripts.css) {
                await chrome.scripting.insertCSS({
                  target: { tabId: tab.id },
                  files: [css]
                })
              }
            }
          }
          
          // 等待content script初始化后再发送消息
          setTimeout(async () => {
            if (tab.id) {
              try {
                await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PANEL' })
              } catch (err) {
                console.error('Failed to show panel after injection:', err)
              }
            }
          }, 100)
        } catch (injectError) {
          console.error('Failed to inject content script:', injectError)
          // 显示错误提示
          chrome.action.setBadgeText({ text: 'ERR', tabId: tab.id })
          chrome.action.setBadgeBackgroundColor({ color: '#FF0000', tabId: tab.id })
          setTimeout(() => {
            chrome.action.setBadgeText({ text: '', tabId: tab.id })
          }, 3000)
        }
      }
    })
  }
}

new BackgroundService()

chrome.runtime.onInstalled.addListener(() => {
  console.log('Web Element Extractor installed')
})