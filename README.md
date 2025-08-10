# Web Element Extractor - 网页元素提取器

一个强大的Chrome浏览器扩展，用于智能提取网页元素信息，支持多种选择模式，输出适合AI开发工具使用的结构化数据。

## ✨ 功能特性

### 🎯 多种选择模式
- **单选模式** - 一次选择一个元素
- **多选模式** - 可以选择多个元素
- **区域选择** - 拖动选择区域内的所有元素（智能过滤子元素）
- **相似元素** - 自动选择相似的元素

### 🎨 优秀的用户体验
- **悬浮面板** - 可拖动的控制面板
- **实时预览** - 鼠标悬停时显示元素信息
- **智能标签** - 选中元素显示编号，悬停显示详情
- **快捷键支持**
  - `Delete/Backspace` - 删除最后选择的元素
  - `Esc` - 清除所有选择

### 📊 智能数据输出
- **精简的JSON格式** - 包含元素的完整定位信息
- **多重定位器** - CSS选择器、XPath、ID、Class等
- **上下文信息** - 父元素链、交互性检测
- **优化的数据结构** - 专为AI开发工具设计

## 🚀 安装使用

### 开发环境安装

1. 克隆仓库
```bash
git clone https://github.com/yourusername/web-element-extractor.git
cd web-element-extractor
```

2. 安装依赖
```bash
npm install
```

3. 构建扩展
```bash
npm run build
```

4. 在Chrome中加载扩展
   - 打开 Chrome，进入 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `dist` 目录

### 使用方法

1. 点击浏览器工具栏的扩展图标打开浮窗
2. 选择所需的选择模式（默认为多选）
3. 点击"开始选择"
4. 在页面上选择需要的元素
5. 点击"复制所有"获取结构化数据

## 📝 输出数据格式示例

```json
{
  "page": {
    "url": "https://example.com",
    "title": "Example Page"
  },
  "elements": [{
    "tag": "button",
    "selector": "#submit-btn",
    "xpath": "//button[@id='submit-btn']",
    "class": "btn btn-primary",
    "text": "Submit",
    "type": "button",
    "pos": [100, 200, 120, 40],
    "parent": ["form", "div"],
    "children": 0
  }]
}
```

## 🛠️ 技术栈

- **框架**: React + TypeScript
- **构建工具**: Vite
- **扩展开发**: Chrome Extension Manifest V3
- **样式**: Tailwind CSS
- **工具库**: CRXJS Vite Plugin

## 📂 项目结构

```
web-element-extractor/
├── src/
│   ├── background/      # 后台脚本
│   ├── content/         # 内容脚本
│   ├── popup/          # 弹窗UI
│   └── shared/         # 共享类型和工具
├── public/             # 静态资源
├── dist/              # 构建输出
└── manifest.json      # 扩展配置
```

## 🔧 开发命令

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 类型检查
npm run type-check
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有贡献者和使用者的支持！

---

**注意**: 本扩展仅用于合法的网页数据提取和开发辅助用途。请遵守网站的使用条款和robots.txt规定。