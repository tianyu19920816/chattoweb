import { useEffect, useState } from 'react'
import { ExtractorState, Message, SelectionMode, OutputFormat } from '../shared/types'
import ElementList from './components/ElementList'
import ControlPanel from './components/ControlPanel'
import OutputPanel from './components/OutputPanel'
import SettingsPanel from './components/SettingsPanel'

type TabType = 'elements' | 'output' | 'settings'

function App() {
  const [state, setState] = useState<ExtractorState>({
    isActive: false,
    mode: 'single',
    selectedElements: [],
    hoveredElement: null,
    outputFormat: 'json',
    selectedTemplate: 'general-web-dev',
    templates: [],
    settings: {
      highlightColor: 'rgba(59, 130, 246, 0.2)',
      selectedColor: 'rgba(239, 68, 68, 0.9)',
      opacity: 0.2,
      showLabels: true,
      autoScroll: true,
      captureEventListeners: false,
      maxElements: 100
    }
  })

  const [activeTab, setActiveTab] = useState<TabType>('elements')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadState()
    setupMessageListener()
  }, [])

  const loadState = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATE' })
      if (response) {
        setState(response)
      }
    } catch (error) {
      console.error('Failed to load state:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setupMessageListener = () => {
    chrome.runtime.onMessage.addListener((message: Message) => {
      if (message.type === 'STATE_UPDATE') {
        loadState()
      }
    })
  }

  const handleActivate = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { 
          type: state.isActive ? 'DEACTIVATE_SELECTION' : 'ACTIVATE_SELECTION' 
        })
        setState(prev => ({ ...prev, isActive: !prev.isActive }))
      } catch (error) {
        console.error('Failed to communicate with content script:', error)
        // Try to inject content script if it's not already injected
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['src/content/index.js']
          })
          // Try again after injection
          await chrome.tabs.sendMessage(tab.id, { 
            type: state.isActive ? 'DEACTIVATE_SELECTION' : 'ACTIVATE_SELECTION' 
          })
          setState(prev => ({ ...prev, isActive: !prev.isActive }))
        } catch (injectError) {
          console.error('Failed to inject content script:', injectError)
          alert('无法在此页面上运行插件。请刷新页面后重试。')
        }
      }
    }
  }

  const handleModeChange = async (mode: SelectionMode) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { 
          type: 'SET_MODE', 
          payload: { mode } 
        })
        setState(prev => ({ ...prev, mode }))
      } catch (error) {
        console.error('Failed to change mode:', error)
      }
    }
  }

  const handleClearSelection = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'CLEAR_SELECTION' })
        setState(prev => ({ ...prev, selectedElements: [] }))
      } catch (error) {
        console.error('Failed to clear selection:', error)
        setState(prev => ({ ...prev, selectedElements: [] }))
      }
    }
  }

  const handleFormatChange = (format: OutputFormat) => {
    setState(prev => ({ ...prev, outputFormat: format }))
  }

  const handleTemplateChange = (templateId: string) => {
    setState(prev => ({ ...prev, selectedTemplate: templateId }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4">
        <h1 className="text-lg font-bold">Web Element Extractor</h1>
        <p className="text-sm opacity-90 mt-1">为AI提供视觉支持的网页元素提取工具</p>
      </header>

      <ControlPanel
        isActive={state.isActive}
        mode={state.mode}
        onActivate={handleActivate}
        onModeChange={handleModeChange}
        onClear={handleClearSelection}
        elementCount={state.selectedElements.length}
      />

      <div className="flex border-b">
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'elements'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('elements')}
        >
          元素列表 ({state.selectedElements.length})
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'output'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('output')}
        >
          输出配置
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          设置
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'elements' && (
          <ElementList elements={state.selectedElements} />
        )}
        {activeTab === 'output' && (
          <OutputPanel
            elements={state.selectedElements}
            format={state.outputFormat}
            selectedTemplate={state.selectedTemplate}
            templates={state.templates}
            onFormatChange={handleFormatChange}
            onTemplateChange={handleTemplateChange}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsPanel settings={state.settings} />
        )}
      </div>
    </div>
  )
}

export default App