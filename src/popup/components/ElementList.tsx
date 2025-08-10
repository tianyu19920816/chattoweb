import React, { useState } from 'react'
import { SelectedElement } from '../../shared/types'

interface ElementListProps {
  elements: SelectedElement[]
}

const ElementList: React.FC<ElementListProps> = ({ elements }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  if (elements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-center">还没有选择任何元素</p>
        <p className="text-sm text-gray-400 mt-2">点击"开始选择"按钮开始</p>
      </div>
    )
  }

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="space-y-2">
        {elements.map((element, index) => (
          <div
            key={element.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div
              className="p-3 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleExpand(element.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <code className="text-sm font-mono text-gray-700">
                    &lt;{element.elementInfo.tagName}&gt;
                  </code>
                  {element.elementInfo.idAttribute && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      #{element.elementInfo.idAttribute}
                    </span>
                  )}
                  {element.elementInfo.className && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded truncate max-w-[150px]">
                      .{typeof element.elementInfo.className === 'string' ? element.elementInfo.className.split(' ')[0] : element.elementInfo.className}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedIds.has(element.id) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {element.elementInfo.text && (
                <p className="text-xs text-gray-600 mt-2 truncate">
                  {element.elementInfo.text.substring(0, 100)}
                </p>
              )}
            </div>

            {expandedIds.has(element.id) && (
              <div className="border-t border-gray-200 p-3 bg-gray-50">
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-gray-700">CSS选择器:</span>
                    <code className="ml-2 text-gray-600 break-all">
                      {element.elementInfo.cssSelector}
                    </code>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">XPath:</span>
                    <code className="ml-2 text-gray-600 break-all">
                      {element.elementInfo.xpath}
                    </code>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">位置:</span>
                    <span className="ml-2 text-gray-600">
                      ({Math.round(element.elementInfo.position.x)}, {Math.round(element.elementInfo.position.y)})
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">尺寸:</span>
                    <span className="ml-2 text-gray-600">
                      {Math.round(element.elementInfo.position.width)} × {Math.round(element.elementInfo.position.height)}
                    </span>
                  </div>
                  {element.elementInfo.children > 0 && (
                    <div>
                      <span className="font-semibold text-gray-700">子元素:</span>
                      <span className="ml-2 text-gray-600">{element.elementInfo.children} 个</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ElementList