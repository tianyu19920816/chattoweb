# Chrome Web Store 发布指南

## 一、注册开发者账号

1. 访问 [Chrome Web Store 开发者仪表板](https://chrome.google.com/webstore/devconsole)
2. 使用Google账号登录
3. 支付一次性注册费用 $5 USD（仅首次注册需要）
4. 填写开发者信息

## 二、准备发布材料

### 必需材料清单：

#### 1. 扩展包文件
- [x] 打包好的 .zip 文件（dist目录）

#### 2. 商店列表资源
- [ ] **扩展名称**：Web Element Extractor - 网页元素提取器
- [ ] **简短描述**（132字符以内）：一键提取网页元素，智能生成AI提示词，支持多种格式导出
- [ ] **详细描述**（最多16,000字符）- 见下方

#### 3. 图形资源
- [x] **扩展图标**：
  - 128x128 px（已有）
  - 48x48 px（已有）
  - 32x32 px（已有）
  - 16x16 px（已有）

- [ ] **商店图标**：
  - 128x128 px（用于商店列表）

- [ ] **宣传图片**（至少1张，最多5张）：
  - 1280x800 px 或 640x400 px
  - 展示扩展的主要功能

- [ ] **小型宣传图块**（可选）：
  - 440x280 px

- [ ] **大型宣传图块**（可选）：
  - 920x680 px

#### 4. 其他信息
- [ ] **类别**：生产力工具 / 开发者工具
- [ ] **语言**：中文（简体）、英文
- [ ] **隐私政策URL**（如果扩展收集用户数据）

## 三、详细描述模板

### 中文版：
```
Web Element Extractor - 专业的网页元素提取工具

🎯 主要功能：
• 智能元素选择：点击即可选中网页上的任何元素
• AI提示词生成：自动生成适合Claude、ChatGPT等AI的结构化提示词
• 多格式导出：支持JSON、Markdown、CSV等多种格式
• 批量提取：一次选择多个元素，批量处理
• 实时预览：选中即预览提取结果
• 历史记录：保存提取历史，方便复用

⚡ 使用场景：
• 数据采集：快速提取网页数据
• AI对话：生成结构化的AI提示词
• 内容整理：提取文章、表格等内容
• 开发调试：获取元素信息和结构
• 自动化测试：提取页面元素用于测试脚本

🔧 快捷操作：
• Ctrl/Cmd + Shift + E：快速开启选择模式
• 右键菜单：快速访问常用功能
• 一键复制：快速复制到剪贴板

💡 特色优势：
• 零配置：安装即用，无需复杂设置
• 隐私安全：所有数据本地处理，不上传服务器
• 轻量快速：优化性能，不影响网页加载
• 持续更新：定期添加新功能和优化

📝 使用说明：
1. 点击扩展图标或使用快捷键激活
2. 点击网页元素进行选择
3. 在弹出面板中查看和编辑
4. 选择导出格式并复制或下载

🔐 隐私承诺：
本扩展不收集、存储或传输任何用户数据。所有操作均在本地完成。

📧 反馈与支持：
如有问题或建议，请访问：https://github.com/tianyu19920816/chattoweb
```

### 英文版：
```
Web Element Extractor - Professional Web Element Extraction Tool

🎯 Key Features:
• Smart Element Selection: Click to select any element on the webpage
• AI Prompt Generation: Auto-generate structured prompts for Claude, ChatGPT, and other AIs
• Multi-format Export: Support JSON, Markdown, CSV and more
• Batch Extraction: Select multiple elements at once
• Real-time Preview: Preview extraction results instantly
• History Records: Save extraction history for reuse

⚡ Use Cases:
• Data Collection: Quickly extract web data
• AI Conversations: Generate structured AI prompts
• Content Organization: Extract articles, tables, and more
• Development Debugging: Get element info and structure
• Automation Testing: Extract page elements for test scripts

🔧 Quick Actions:
• Ctrl/Cmd + Shift + E: Quick selection mode
• Context Menu: Quick access to common features
• One-click Copy: Copy to clipboard instantly

💡 Advantages:
• Zero Configuration: Ready to use after installation
• Privacy & Security: All data processed locally
• Lightweight & Fast: Optimized performance
• Regular Updates: New features and improvements

📝 How to Use:
1. Click extension icon or use keyboard shortcut
2. Click web elements to select
3. View and edit in the popup panel
4. Choose export format and copy or download

🔐 Privacy Promise:
This extension does not collect, store, or transmit any user data. All operations are performed locally.

📧 Feedback & Support:
For issues or suggestions, visit: https://github.com/tianyu19920816/chattoweb
```

## 四、发布步骤

1. **准备文件**：
   ```bash
   npm run build
   cd dist
   zip -r ../web-element-extractor.zip .
   ```

2. **登录开发者仪表板**：
   https://chrome.google.com/webstore/devconsole

3. **创建新项目**：
   - 点击"新建项目"
   - 上传 web-element-extractor.zip
   - 填写商品详情

4. **设置定价和分发**：
   - 选择免费
   - 选择所有地区

5. **提交审核**：
   - 检查所有必填项
   - 提交审核
   - 等待审核（通常1-3个工作日）

## 五、审核注意事项

1. **权限说明**：确保manifest中的权限都有合理用途
2. **隐私政策**：如果收集数据需要提供隐私政策
3. **功能完整**：确保所有声明的功能都正常工作
4. **无恶意代码**：不包含任何恶意或误导性代码
5. **用户体验**：界面友好，操作简单

## 六、发布后维护

1. 监控用户反馈和评分
2. 及时修复bug
3. 定期更新功能
4. 回复用户评论
5. 更新商店列表信息

## 七、营销建议

1. 在GitHub创建详细的README
2. 在相关社区分享
3. 制作使用教程视频
4. 收集用户反馈改进产品