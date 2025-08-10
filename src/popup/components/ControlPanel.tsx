import React from 'react'
import { SelectionMode } from '../../shared/types'

interface ControlPanelProps {
  isActive: boolean
  mode: SelectionMode
  elementCount: number
  onActivate: () => void
  onModeChange: (mode: SelectionMode) => void
  onClear: () => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isActive,
  mode,
  elementCount,
  onActivate,
  onModeChange,
  onClear
}) => {
  const modes: { value: SelectionMode; label: string; icon: string }[] = [
    { value: 'single', label: '单选', icon: '⚫' },
    { value: 'multiple', label: '多选', icon: '⚫⚫' },
    { value: 'area', label: '区域', icon: '⬜' },
    { value: 'smart', label: '智能', icon: '✨' }
  ]

  return (
    <div className="p-4 bg-gray-50 border-b">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onActivate}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          {isActive ? '停止选择' : '开始选择'}
        </button>

        {elementCount > 0 && (
          <button
            onClick={onClear}
            className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            清除所有 ({elementCount})
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {modes.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => onModeChange(value)}
            disabled={!isActive}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === value
                ? 'bg-primary-100 text-primary-700 border border-primary-300'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            } ${!isActive && 'opacity-50 cursor-not-allowed'}`}
          >
            <span className="mr-1">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {isActive && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            {mode === 'single' && '点击元素进行选择'}
            {mode === 'multiple' && '按住 Ctrl/Cmd 键多选'}
            {mode === 'area' && '拖拽框选多个元素'}
            {mode === 'smart' && '自动选择相似元素'}
          </p>
        </div>
      )}
    </div>
  )
}

export default ControlPanel