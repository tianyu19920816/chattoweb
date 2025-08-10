import { Template, SelectedElement } from '../types'

export const builtInTemplates: Template[] = [
  {
    id: 'general-web-dev',
    name: '通用Web开发',
    description: '提取元素的完整HTML和CSS信息',
    format: 'markdown',
    template: `
## 选中的网页元素

{{#elements}}
### 元素 {{index}}
- **标签**: \`{{tagName}}\`
- **ID**: {{idAttribute}}
- **类名**: {{className}}
- **选择器**: \`{{cssSelector}}\`
- **XPath**: \`{{xpath}}\`

#### HTML内容
\`\`\`html
{{html}}
\`\`\`

#### 计算样式
\`\`\`css
{{styles}}
\`\`\`

#### 位置信息
- 位置: ({{position.x}}, {{position.y}})
- 尺寸: {{position.width}} x {{position.height}}

{{/elements}}
`,
    variables: ['elements', 'tagName', 'idAttribute', 'className', 'cssSelector', 'xpath', 'html', 'styles', 'position'],
    isBuiltIn: true
  },
  {
    id: 'react-component',
    name: 'React组件提取',
    description: '生成React组件代码',
    format: 'markdown',
    template: `
请帮我基于以下HTML结构创建一个React组件：

{{#elements}}
### 原始HTML ({{tagName}})
\`\`\`html
{{html}}
\`\`\`

### 样式信息
- 显示: {{computedStyles.display}}
- 位置: {{computedStyles.position}}
- 尺寸: {{computedStyles.width}} x {{computedStyles.height}}
- 颜色: {{computedStyles.color}}
- 背景: {{computedStyles.backgroundColor}}

{{/elements}}

要求：
1. 使用函数组件和TypeScript
2. 使用Tailwind CSS处理样式
3. 提取可复用的props
4. 添加适当的事件处理
`,
    variables: ['elements', 'tagName', 'html', 'computedStyles'],
    isBuiltIn: true
  },
  {
    id: 'vue-component',
    name: 'Vue组件提取',
    description: '生成Vue组件代码',
    format: 'markdown',
    template: `
请帮我基于以下HTML结构创建一个Vue 3组件：

{{#elements}}
### 原始HTML
\`\`\`html
{{html}}
\`\`\`

### 元素信息
- 标签: {{tagName}}
- 类名: {{className}}
- ID: {{idAttribute}}

{{/elements}}

要求：
1. 使用Composition API
2. 使用TypeScript
3. 保持原有的交互逻辑
4. 使用scoped样式
`,
    variables: ['elements', 'html', 'tagName', 'className', 'idAttribute'],
    isBuiltIn: true
  },
  {
    id: 'automation-test',
    name: '自动化测试',
    description: '生成自动化测试选择器',
    format: 'json',
    template: `{
  "testCases": [
    {{#elements}}
    {
      "name": "Test {{tagName}} element",
      "selector": "{{cssSelector}}",
      "xpath": "{{xpath}}",
      "attributes": {{attributesJson}},
      "text": "{{text}}",
      "actions": ["click", "input", "verify"]
    }{{#unless isLast}},{{/unless}}
    {{/elements}}
  ]
}`,
    variables: ['elements', 'tagName', 'cssSelector', 'xpath', 'attributesJson', 'text'],
    isBuiltIn: true
  }
]

export function processTemplate(template: Template, elements: SelectedElement[]): string {
  let result = template.template
  
  const elementsData = elements.map((el, index) => ({
    ...el.elementInfo,
    index: index + 1,
    styles: formatStyles(el.elementInfo.computedStyles),
    attributesJson: JSON.stringify(el.elementInfo.attributes, null, 2),
    isLast: index === elements.length - 1
  }))
  
  result = result.replace(/{{#elements}}([\s\S]*?){{\/elements}}/g, (_match, content) => {
    return elementsData.map(data => {
      let elementContent = content
      Object.keys(data).forEach(key => {
        const value = (data as any)[key]
        const regex = new RegExp(`{{${key}}}`, 'g')
        elementContent = elementContent.replace(regex, 
          typeof value === 'object' ? JSON.stringify(value) : value)
      })
      return elementContent
    }).join('')
  })
  
  return result
}

function formatStyles(styles: Partial<CSSStyleDeclaration>): string {
  return Object.entries(styles)
    .filter(([_, value]) => value && value !== '')
    .map(([key, value]) => `${kebabCase(key)}: ${value};`)
    .join('\n')
}

function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

export function generateJSON(elements: SelectedElement[]): string {
  return JSON.stringify(elements.map(el => el.elementInfo), null, 2)
}

export function generateXML(elements: SelectedElement[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<elements>\n'
  
  elements.forEach(el => {
    xml += '  <element>\n'
    xml += `    <tagName>${el.elementInfo.tagName}</tagName>\n`
    xml += `    <id>${el.elementInfo.idAttribute}</id>\n`
    xml += `    <class>${el.elementInfo.className}</class>\n`
    xml += `    <selector>${escapeXml(el.elementInfo.cssSelector)}</selector>\n`
    xml += `    <xpath>${escapeXml(el.elementInfo.xpath)}</xpath>\n`
    xml += `    <text>${escapeXml(el.elementInfo.text)}</text>\n`
    xml += '    <attributes>\n'
    
    Object.entries(el.elementInfo.attributes).forEach(([key, value]) => {
      xml += `      <${key}>${escapeXml(value)}</${key}>\n`
    })
    
    xml += '    </attributes>\n'
    xml += '  </element>\n'
  })
  
  xml += '</elements>'
  return xml
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function generateMarkdown(elements: SelectedElement[]): string {
  const defaultTemplate = builtInTemplates.find(t => t.id === 'general-web-dev')!
  return processTemplate(defaultTemplate, elements)
}