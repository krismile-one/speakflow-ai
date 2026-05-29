# SpeakFlow AI · 听见你的进步，逐句纠正

一款 AI 驱动的英语口语智能分析工具，上传英语录音，AI 自动转写、逐句切分，并为每个单词标注 IPA 音标与中文释义，助力纯正口语。

🔗 **在线体验**：https://speakflow-ai-pearl.vercel.app/

---

## 产品截图

### 首页
<img width="933" height="791" alt="870698773eb5c84ada5165dea2e161c3" src="https://github.com/user-attachments/assets/4997bb84-8f6b-45fe-8a57-46af16f675c6" />


### 上传页面
<img width="895" height="725" alt="c2f49b9e7e193023b91bef0976dba905" src="https://github.com/user-attachments/assets/e3fe00bc-ac78-459f-9cc9-ae09e76b67ab" />


### 分析结果
<img width="1001" height="814" alt="1bfbcc73e60406a6d836bc04e3d612d8" src="https://github.com/user-attachments/assets/79f286c2-ee4d-4bf3-ac5e-78cdae86eb8b" />
<img width="1070" height="810" alt="abb9e6737a3e7df34ff6ac2cbe8195bf" src="https://github.com/user-attachments/assets/c89a2e31-24f9-4d75-aa60-33417105dfef" />


---

## 产品功能

- **音频上传 / 在线录音**：支持本地音频文件（MP3/WAV/M4A）或浏览器实时录音
- **AI 语音转写**：基于 Google Gemini 多模态模型，自动识别英语口语内容
- **逐句切分**：智能划分句子并标注时间戳，点击即可重复播放对应片段
- **单词级解析**：每个单词配套 IPA 国际音标、中文释义、用法例句
- **真人发音**：浏览器原生 TTS 朗读单词，辅助纠音

## 适用场景

- 英语口语学习者：跟读、纠音、扩充词汇
- 听力练习：通过逐句精听 + 单词释义提升理解
- 口语作业批改：上传录音获取完整分析

---

## 技术栈

| 类型 | 选型 |
|------|------|
| 前端框架 | React + TypeScript |
| 构建工具 | Vite |
| UI 组件 | Tailwind CSS + shadcn/ui |
| AI 模型 | Google Gemini（多模态） |
| 后端 | Vercel Serverless Functions |
| 部署 | Vercel |

## 架构亮点

**密钥安全设计**：API Key 通过 Vercel Serverless Function 后端代理，与前端完全隔离，避免在浏览器中暴露，保障产品上线后的密钥安全。
浏览器（前端） → /api/analyze（后端代理） → Gemini API
↑
API Key 仅存于服务端

---

## 本地运行

```bash
# 安装依赖
npm install

# 配置环境变量
# 在项目根目录创建 .env 文件，填入：
# GEMINI_API_KEY=你的Gemini API密钥

# 启动开发服务器（仅前端）
npm run dev

# 完整运行前后端，需安装 Vercel CLI
npm install -g vercel
vercel dev
```

---

## 项目结构
speakflow-ai/
├── api/                    # Vercel Serverless 后端函数
│   └── analyze.ts          # Gemini API 调用代理
├── src/
│   ├── App.tsx             # 主应用
│   ├── components/         # 业务组件（录音器、上传、句子卡片）
│   ├── services/           # API 服务层
│   └── lib/                # 工具函数（TTS 等）
├── components/ui/          # 通用 UI 组件
└── vite.config.ts          # Vite 配置

---

## 开发说明

本项目使用 AI 辅助开发（Google AI Studio）完成原型搭建，并独立完成密钥安全改造、部署上线流程。

## License

MIT
