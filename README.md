# WordMaster - 智能英语单词学习工具

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/language-JavaScript-yellow.svg" alt="Language">
  <img src="https://img.shields.io/badge/CET4-3700%2B%20words-orange.svg" alt="CET4 Words">
</div>

<p align="center">
  <strong>一款基于遗忘曲线的智能英语四级单词学习应用</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#使用说明">使用说明</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#贡献指南">贡献指南</a>
</p>

---

## 📖 项目简介

WordMaster 是一款专为英语四级考试设计的智能单词学习工具。它结合了艾宾浩斯遗忘曲线算法和现代化的用户界面，帮助学生高效记忆四级词汇。

### ✨ 核心亮点

- 🎯 **智能记忆算法**：基于艾宾浩斯遗忘曲线，自动安排复习时间
- 📚 **3700+ 四级词汇**：内置完整的CET4词库
- 🌐 **多数据源支持**：集成牛津词典、有道词典等多个权威数据源
- 💾 **本地存储**：所有数据保存在本地，保护隐私
- 📱 **响应式设计**：完美适配桌面和移动设备
- 🎨 **现代UI**：采用Swiss Modernism设计风格，简洁美观

## 🚀 功能特性

### 1. 生词记录系统

#### 智能查询
- ✅ 输入英文单词自动查询词典
- ✅ 自动获取音标、英文释义和例句
- ✅ **多层中文释义获取策略**：
  - **第一优先级**：CET4本地词典（3700+四级词汇）
  - **第二优先级**：有道词典API（详细多词性释义）
  - **第三优先级**：MyMemory翻译服务（备用方案）
- ✅ 自动去重和格式化输出

#### 单词管理
- ✅ 本地持久化存储所有单词数据
- ✅ 支持删除已添加的单词
- ✅ 实时显示单词本统计信息

### 2. 智能背诵模式

#### 双模式学习
- ✅ **显示中文，回忆英文**：强化拼写能力
- ✅ **显示英文，回忆中文**：提升理解能力

#### 交互反馈机制
- ✅ **记得按钮**：
  - 点击后显示二次确认选项
  - "我真的记住啦" → 标记为掌握
  - "补好>_<，还是不记得" → 加入待复习队列
- ✅ **不记得按钮**：
  - 显示完整释义
  - 点击"这次一定记住" → 加入待复习队列
- ✅ 每5个单词后自动插入待复习单词

#### 进度追踪
- ✅ 随机打乱单词顺序
- ✅ 实时显示背诵进度条
- ✅ 完成统计展示

### 3. 遗忘曲线算法

#### 智能复习调度
- ✅ 根据复习次数自动计算下次复习时间
- ✅ 连续正确3次标记为已掌握
- ✅ 错误回答重置学习进度
- ✅ 动态调整复习间隔：
  - 第1次：30分钟后
  - 第2次：1小时后
  - 第3次：8小时后
  - 第4次：1天后
  - 第5次：3天后
  - 之后：7天后

#### 学习统计
- ✅ 记录每个单词的学习状态
- ✅ 跟踪连续正确次数
- ✅ 保存上次复习时间
- ✅ 预测下次复习时间

## 🛠️ 技术栈

### 前端技术
- **HTML5** - 语义化页面结构
- **CSS3** - 现代样式设计
  - CSS Variables（设计令牌）
  - Flexbox & Grid 布局
  - 响应式设计
  - 平滑动画过渡
- **JavaScript (ES6+)** - 应用逻辑
  - Async/Await 异步处理
  - LocalStorage 数据持久化
  - DOM 操作优化

### 字体与图标
- **Inter** - 主要正文字体
- **Space Grotesk** - 标题显示字体
- **Emoji Icons** - 原生表情符号图标

### 外部API
- **Dictionary API** - 免费英语词典（音标、英文释义、例句）
- **有道词典API** - 详细中文释义（多词性、多义项）
- **MyMemory API** - 备用翻译服务

### 本地数据
- **CET4.json** - 四级词典数据（JSON Lines格式，3740个词汇）
- **localStorage** - 浏览器本地存储

## 📦 快速开始

### 前置要求

- 现代浏览器（Chrome 90+、Firefox 88+、Safari 14+、Edge 90+）
- 网络连接（用于查询在线词典API）

### 安装步骤

#### 方法一：直接打开（推荐）

```bash
# 克隆仓库
git clone https://github.com/your-username/wordmaster.git

# 进入项目目录
cd wordmaster

# 直接在浏览器中打开 index.html
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

#### 方法二：使用本地服务器

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080

# Node.js (需要安装 http-server)
npx http-server -p 8080

# 访问 http://localhost:8080
```

### 首次使用

1. 打开应用后，切换到"记录"标签页
2. 在输入框中输入想要学习的英文单词
3. 点击"查询并添加"或按回车键
4. 系统会自动查询并显示单词详情
5. 切换到"背诵"标签页开始学习

## 📖 使用说明

### 记录生词

1. **输入单词**：在搜索框中输入英文单词
2. **自动查询**：系统会从多个数据源获取详细信息
3. **查看结果**：显示音标、中英文释义、例句等
4. **添加到单词本**：自动保存到本地存储

### 背诵单词

1. **选择模式**：
   - "显示中文，回忆英文"：适合练习拼写
   - "显示英文，回忆中文"：适合测试理解

2. **开始背诵**：点击"开始背诵"按钮

3. **学习流程**：
   - 查看提示（中文或英文）
   - 尝试回忆对应内容
   - 点击"记得"或"不记得"
   - 根据提示进行二次确认
   - 系统自动进入下一个单词

4. **完成学习**：查看所有单词后显示统计信息

### 数据管理

- **数据存储位置**：浏览器 localStorage
- **数据备份**：建议定期导出重要单词
- **数据清除**：清除浏览器缓存会删除所有数据

## 📁 项目结构

```
单词开发/
├── index.html              # 主页面入口
├── style.css               # 样式文件（818行）
│   ├── CSS Variables       # 设计令牌系统
│   ├── 响应式布局          # 移动端适配
│   └── 动画效果            # 过渡和关键帧
├── app.js                  # 应用逻辑（779行）
│   ├── AppState            # 状态管理
│   ├── CET4词典加载        # 本地词典解析
│   ├── 多数据源查询        # 词典API集成
│   ├── 遗忘曲线算法        # 智能复习调度
│   └── localStorage操作    # 数据持久化
├── CET4.json               # 四级词典数据（3740个词汇）
├── README.md               # 项目说明文档
├── TEST_GUIDE.md           # 测试指南
├── UPDATE_NOTES.md         # 更新日志
├── FORGOTTEN_CURVE_GUIDE.md # 遗忘曲线算法详解
├── STUDY_MODE_UPDATE.md    # 背诵模式更新说明
└── CET4_INTEGRATION.md     # CET4词典集成文档
```

## 🎨 设计特色

### Swiss Modernism 2.0 风格

- **极简主义**：去除多余装饰，专注内容
- **网格系统**：基于8px的间距规范
- **排版层次**：清晰的视觉层级
- **留白艺术**：充足的呼吸空间

### 色彩系统

```css
--color-primary: #6366F1      /* 主题色：靛蓝 */
--color-success: #10B981      /* 成功色：翠绿 */
--color-danger: #EF4444       /* 危险色：鲜红 */
--color-warning: #F59E0B      /* 警告色：琥珀 */
```

### 响应式断点

- **Desktop**: > 768px
- **Tablet**: 481px - 768px
- **Mobile**: ≤ 480px

## 🔧 扩展开发

### 添加新的词典API

```javascript
// 在 getDetailedChineseMeaning 函数中添加
async function getNewDictionary(word) {
    const response = await fetch(`YOUR_API_URL/${word}`);
    // 解析并返回释义
}
```

### 自定义复习间隔

修改 `calculateNextReviewTime` 函数中的时间间隔配置：

```javascript
switch(reviewCount) {
    case 0: intervalHours = 0.5; break;  // 自定义时间
    // ...
}
```

### 导出数据功能

```javascript
function exportWords() {
    const dataStr = JSON.stringify(AppState.words, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    // 触发下载
}
```

## 📊 性能优化

- ✅ 懒加载CET4词典数据
- ✅ 防抖处理的输入查询
- ✅ 优化的DOM更新策略
- ✅ 高效的数组操作方法
- ✅ 最小化的重绘和回流

## 🐛 已知问题

1. **API限制**：免费词典API可能有请求频率限制
2. **离线使用**：首次加载需要网络，后续可离线使用已查询单词
3. **浏览器兼容**：不支持IE11及以下版本

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 贡献步骤

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 遵循现有的代码风格
- 添加必要的注释
- 确保功能测试通过
- 更新相关文档

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- [Free Dictionary API](https://dictionaryapi.dev/) - 提供英文词典数据
- [有道词典](https://dict.youdao.com/) - 提供中文释义
- [MyMemory Translation](https://mymemory.translated.net/) - 备用翻译服务
- [Google Fonts](https://fonts.google.com/) - Inter 和 Space Grotesk 字体

## 📮 联系方式

如有问题或建议，请通过以下方式联系：

- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/wordmaster/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/wordmaster/discussions)

---

<div align="center">
  <p>如果这个项目对你有帮助，请给一个 ⭐ Star 支持！</p>
  <p>Made with ❤️ by WordMaster Team</p>
</div>
