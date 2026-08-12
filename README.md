# P2P Streaming — WebRTC Mesh Application

![App Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey.svg)
![WebRTC](https://img.shields.io/badge/tech-WebRTC-orange.svg)

**P2P Streaming** is a modern, decentralized application for screen sharing and communication built on **WebRTC Mesh** architecture. The application does not require dedicated media servers (SFU/MCU) — all video and audio traffic is transmitted directly (Peer-to-Peer) between room participants, ensuring maximum privacy, low latency, and no session time limits.

The project is based on **Nuxt 4 / Vue 3**, and the desktop versions are built using **Electron**. 

## 📖 Documentation (Language Selection)

Please select your preferred language to read the full documentation, which includes instructions on how to use the desktop application, web version, local development guide, and CI/CD workflows:

- 🇺🇸 [English Documentation](./README.en.md)
- 🇷🇺 [Русская документация](./README.ru.md)
- 🇺🇦 [Українська документація](./README.uk.md)

---

### Quick Start (Dev)

```bash
# Clone the repository
git clone <your-repo-url>
cd p2p-streaming

# Install dependencies
pnpm install

# Run development server
pnpm run dev
```

For full setup instructions, including `.env` configuration for Metered.ca, please refer to the language-specific documentation linked above.
