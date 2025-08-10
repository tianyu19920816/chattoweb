import React, { useState, useEffect } from 'react'
import { SelectedElement, OutputFormat, Template } from '../../shared/types'

interface OutputPanelProps {
  elements: SelectedElement[]
  format: OutputFormat
  selectedTemplate: string
  templates: Template[]
  onFormatChange: (format: OutputFormat) => void
  onTemplateChange: (templateId: string) => void
}

const OutputPanel: React.FC<OutputPanelProps> = ({
  elements,
  format,
  selectedTemplate,
  templates,
  onFormatChange,
  onTemplateChange
}) => {
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const formats: { value: OutputFormat; label: string; icon: string }[] = [
    { value: 'json', label: 'JSON', icon: '{ }' },
    { value: 'xml', label: 'XML', icon: '< >' },
    { value: 'markdown', label: 'Markdown', icon: 'M↓' },
    { value: 'custom', label: '自定义', icon: '✏️' }
  ]

  useEffect(() => {
    generateOutput()
  }, [elements, format, selectedTemplate])

  const generateOutput = async () => {
    if (elements.length === 0) {
      setOutput('')
      return
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GENERATE_PROMPT',
        payload: { format, templateId: selectedTemplate }
      })
      
      if (response.success) {
        setOutput(response.prompt)
      }
    } catch (error) {
      console.error('Failed to generate output:', error)
      setOutput('生成输出失败')
    }
  }

  const handleCopy = async () => {
    try {
      await chrome.runtime.sendMessage({
        type: 'COPY_TO_CLIPBOARD',
        payload: { text: output }
      })
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleExport = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `elements-${Date.now()}.${format === 'json' ? 'json' : format === 'xml' ? 'xml' : 'md'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-gray-50">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
          <div className="grid grid-cols-4 gap-2">
            {formats.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => onFormatChange(value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  format === value
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="block text-xs mb-1">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {format === 'custom' && templates.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择模板</label>
            <select
              value={selectedTemplate}
              onChange={(e) => onTemplateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} {template.isBuiltIn && '(内置)'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        {elements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>请先选择元素</p>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
              <pre className="w-full h-full p-3 bg-gray-900 text-gray-100 text-xs font-mono rounded-lg overflow-auto">
                {output || '生成中...'}
              </pre>
            </div>
            
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleCopy}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {copied ? '已复制!' : '复制到剪贴板'}
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                导出文件
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OutputPanel