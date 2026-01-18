# 🦊 Orchestify IDE

**The AI Agent Orchestration IDE** - A VS Code fork designed for managing teams of AI coding agents.

![Orchestify Logo](resources/linux/orchestify.png)

## 🎯 Vision

Orchestify transforms your development workflow by allowing you to orchestrate multiple AI "Junior Developer" agents. Like a conductor leading an orchestra, you direct specialized agents to handle frontend, backend, testing, and documentation tasks simultaneously.

## ✨ Features

- **🎭 Multi-Agent Orchestration** - Run multiple AI agents in parallel with distinct roles
- **🔴 Real-Time Streaming** - Watch agent thoughts, code changes, and terminal output live
- **🎺 Conductor Mode** - Pause, edit, and resume agent workflows with your "baton"
- **📊 Fox Dashboard** - Visualize active agents and their current tasks
- **🧠 Local RAG** - Agents understand your entire codebase through intelligent indexing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- [Ollama](https://ollama.ai) for local LLM inference

### Development Setup

```bash
# Clone the repository
git clone https://github.com/antigravity/orchestify.git
cd orchestify

# Install dependencies
npm install

# Start development build
npm run watch

# In a new terminal, launch the IDE
./scripts/code.sh
```

## 🎨 Design Philosophy

Orchestify features a unique visual identity:
- **Deep Burgundy** (#2A0A0A) base theme
- **Sunset Orange** (#FF8C00) primary accents
- **Cyan Glow** for active agent states
- **Glassmorphism** UI components

## 🛠️ Architecture

```
orchestify/
├── src/vs/           # Core VS Code modules
├── extensions/       # Built-in extensions
├── orchestify/       # Agent orchestration layer (coming soon)
│   ├── conductor/    # Main orchestration engine
│   ├── agents/       # Junior Dev personas
│   └── skills/       # MCP tool implementations
└── resources/        # Platform assets & icons
```

## 📜 License

MIT License - See [LICENSE.txt](LICENSE.txt)

## 🤝 Contributing

We welcome contributions! Please see our contribution guidelines for more details.

---

**Built with ❤️ by Antigravity**
