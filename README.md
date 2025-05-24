# 🚀 Whispr - Your AI-Powered Meeting Assistant

<div align="center">
  <img src="public/github_logo.png" alt="Whispr Logo" width="200"/>
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Remix](https://img.shields.io/badge/Remix-000000?style=for-the-badge&logo=remix&logoColor=white)](https://remix.run/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
</div>

## 📝 Overview

Whispr is an intelligent meeting assistant that revolutionizes how you handle meetings. It provides real-time transcription, automatic summarization, and AI-powered insights, making your meetings more productive and accessible.

## ✨ Key Features

### 🤖 AI-Powered Meeting Intelligence
- Real-time speech-to-text transcription
- Automatic meeting summarization
- Key points and action items extraction
- Smart follow-up question suggestions

### 📊 Meeting Management
- Google Calendar integration
- Meeting scheduling and reminders
- Past meetings archive
- Meeting analytics and insights

### 🔄 Real-Time Collaboration
- Live transcription during meetings
- Instant meeting summaries
- Interactive Q&A with meeting content
- Shared meeting notes and highlights

### 🎯 Productivity Tools
- Action item tracking
- Decision logging
- Meeting memory bank
- Custom meeting templates

### 🔒 Security & Privacy
- End-to-end encryption
- Secure authentication
- Privacy-focused design
- Data protection compliance

## 🎯 Use Cases

- **Business Meetings**: Capture and analyze important discussions
- **Team Standups**: Track progress and action items
- **Client Calls**: Generate meeting summaries and follow-ups
- **Interviews**: Create accurate transcripts and notes
- **Educational Sessions**: Record and summarize lectures
- **Remote Teams**: Bridge communication gaps

## 🛠️ Tech Stack

- **Frontend Framework:** Remix + React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Firebase
- **AI Integration:** Google Generative AI
- **Build Tool:** Vite
- **Authentication:** Firebase Auth
- **Calendar Integration:** Google Calendar API

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm or yarn
- Firebase account
- Google AI API access
- Google Calendar API access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/whispr.git
cd whispr
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.template .env
```

4. Start the development server:
```bash
npm run dev
```
Visit `http://localhost:3000` to see your application.

## 🏗️ Project Structure

```
whispr/
├── app/                    # Main application code
│   ├── components/        # Reusable React components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   ├── meeting/      # Meeting-related components
│   │   └── shared/       # Shared UI components
│   ├── routes/           # Application routes
│   ├── utils/            # Utility functions
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts
│   ├── types/            # TypeScript type definitions
│   └── firestoredb/      # Firebase database operations
├── public/               # Static assets
└── ...config files
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Remix](https://remix.run/) - For the amazing web framework
- [Google AI](https://ai.google/) - For powerful AI capabilities
- [Firebase](https://firebase.google.com/) - For backend services
- [Tailwind CSS](https://tailwindcss.com/) - For beautiful UI components

---

<div align="center">
  Made with ❤️ by Arpit Singhal
</div>
