import React, { useState } from 'react'
import { ExtractorSettings } from '../../shared/types'

interface SettingsPanelProps {
  settings: ExtractorSettings
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings: initialSettings }) => {
  const [settings, setSettings] = useState(initialSettings)
  const [saved, setSaved] = useState(false)

  const handleChange = (key: keyof ExtractorSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      await chrome.runtime.sendMessage({
        type: 'UPDATE_SETTINGS',
        payload: settings
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const handleReset = () => {
    const defaultSettings: ExtractorSettings = {
      highlightColor: 'rgba(59, 130, 246, 0.2)',
      selectedColor: 'rgba(239, 68, 68, 0.9)',
      opacity: 0.2,
      showLabels: true,
      autoScroll: true,
      captureEventListeners: false,
      maxElements: 100
    }
    setSettings(defaultSettings)
  }

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">视觉设置</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">悬停颜色</label>
              <input
                type="text"
                value={settings.highlightColor}
                onChange={(e) => handleChange('highlightColor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="rgba(59, 130, 246, 0.2)"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">选中颜色</label>
              <input
                type="text"
                value={settings.selectedColor}
                onChange={(e) => handleChange('selectedColor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="rgba(239, 68, 68, 0.9)"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">透明度</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.opacity}
                onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{settings.opacity}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">功能设置</h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showLabels}
                onChange={(e) => handleChange('showLabels', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">显示元素编号标签</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoScroll}
                onChange={(e) => handleChange('autoScroll', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">自动滚动到选中元素</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.captureEventListeners}
                onChange={(e) => handleChange('captureEventListeners', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">捕获事件监听器</span>
            </label>

            <div>
              <label className="block text-xs text-gray-600 mb-1">最大选择元素数</label>
              <input
                type="number"
                min="1"
                max="500"
                value={settings.maxElements}
                onChange={(e) => handleChange('maxElements', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">快捷键</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>切换选择模式</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Ctrl+Shift+E</kbd>
            </div>
            <div className="flex justify-between">
              <span>退出选择</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Esc</kbd>
            </div>
            <div className="flex justify-between">
              <span>选择所有相似元素</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Ctrl+A</kbd>
            </div>
            <div className="flex justify-between">
              <span>删除最后选择</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Delete</kbd>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <button
            onClick={handleSave}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
          >
            {saved ? '已保存!' : '保存设置'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            重置
          </button>
        </div>

        <div className="pt-4 border-t text-center">
          <p className="text-xs text-gray-500">
            Web Element Extractor v0.1.0
          </p>
          <p className="text-xs text-gray-400 mt-1">
            为AI提供视觉支持
          </p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel