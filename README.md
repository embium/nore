# Nore

Nore is a modern, cross-platform desktop application that acts as an extensible AI front-end. It provides a centralized chat interface to interact with a wide range of AI models, execute complex tasks through integrated tools, and expand its capabilities by installing various MCP Servers.

## 🚀 Key Features

- **Unified Chat Interface:** Interact with various AI models through a clean and intuitive chat window.
- **Extensive AI Provider Support:** Connect to a wide array of AI services, including local models via **Ollama**, and cloud providers like **Google Gemini**, **OpenAI**, **Claude**, **Groq**, **DeepSeek**, **TogetherAI**, **LMStudio**, and **Perplexity**.
- **Local LLM Management:** A built-in **Model Hub** allows you to browse, search, install, and manage local Ollama models directly within the application.
- **Extensible Functionality with MCP Servers:** Enhance Nore's capabilities by Browse and installing "MCP Servers" from a registry. Available servers include a **Knowledge Graph Memory Server**, **TaskManager**, **Desktop Commander**, and integrations for **Figma**, **Microsoft Word**, and **PowerPoint**.
- **Deep Customization:** Tailor the application to your liking with extensive settings for appearance (Light/Dark themes, accent colors, fonts) and server configuration (commands, environment variables).
- **Cross-Platform:** As a modern desktop application, Nore is designed to run on multiple operating systems.

- **Robust Framework:** Built on a solid foundation with **TypeScript**, **Vite**, and a backend component in **Rust**.

## 💻 Tech Stack

### Frontend

- **Framework:** React
- **UI Components:** Shadcn
- **Styling:** Tailwind CSS
- **State Management:** Legendapp State
- **Routing:** TanStack Router

### Backend & Core

- **Framework:** Electron
- **Language:** TypeScript, with a Rust component
- **Database:** PouchDB / Relational Pouch
- **API:** tRPC for communication between Electron processes

### Tooling

- **Build Tool:** Vite
- **Linter/Formatter:** Biome
- **Package Manager:** npm (with workspaces)
