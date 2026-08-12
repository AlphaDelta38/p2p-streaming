# P2P Streaming — WebRTC Mesh Application

![App Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey.svg)
![WebRTC](https://img.shields.io/badge/tech-WebRTC-orange.svg)

**P2P Streaming** is a modern, decentralized application for screen sharing and communication built on **WebRTC Mesh** architecture. The application does not require dedicated media servers (SFU/MCU) — all video and audio traffic is transmitted directly (Peer-to-Peer) between room participants, ensuring maximum privacy, low latency, and no session time limits.

The project is based on **Nuxt 4 / Vue 3**, and the desktop versions are built using **Electron**. Signaling (user discovery) and strict firewall traversal (via STUN/TURN protocols) are powered by **Metered.ca** infrastructure.

---

## 🚀 How to Use the Application

This application comes in two forms: **Desktop Version (Installers)** and **Web Version (Browser-based)**. Regardless of the platform, they are fully interoperable.

### 1. Desktop Version (Installers: .exe / .dmg / .AppImage)

For maximum performance, native notifications, and independence from browser tabs, we provide desktop applications.

**Installation:**
1. Go to the **Releases** section of our GitHub repository.
2. Download the installer for your OS:
   - **Windows:** Download and run the `.exe` file.
   - **macOS:** Download the `.dmg` file, open it, and drag the `P2P Streaming` icon into your `Applications` folder.
   - **Linux:** Download the `.AppImage` file, make it executable (`chmod +x app.AppImage`), and run it.

**Usage:**
- Upon launching, you will see the main lobby.
- Click **"Create Room"** to get a unique room code (e.g., `A8F3K9`).
- Share this code with your colleagues or friends.
- To join an existing session, enter the code and click **"Join Room"**.
- Use the bottom control bar to toggle your microphone or start screen sharing.

### 2. Web Version (Deployed App)

**Usage:**
1. Navigate to the official web application link.
2. Allow your browser to access your camera and microphone.
3. The logic is identical to the desktop version. You can copy the room code with a single click.

---

## 🛠 Developer Guide

### Requirements
- **Node.js:** Version 24 or higher.
- **Package Manager:** `pnpm` (version 11+).

### Project Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd p2p-streaming
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables in `.env`:
   ```env
   NUXT_PUBLIC_METERED_API_KEY=your_secret_key_here
   ```

### Local Development

- **Development Web Server (with Hot Reloading):**
  ```bash
  pnpm run dev
  ```
- **Run Electron in Development Mode:**
  ```bash
  pnpm run app:dev
  ```

### Building the Application

- **Generate Static Files for Web Deployment (Vercel, Netlify, etc.):**
  ```bash
  pnpm run generate
  ```
- **Build Electron Installers (Desktop App):**
  ```bash
  pnpm run app:build
  ```

### Continuous Integration & Release (CI/CD)

- **Automated Checks (CI):** On every Push/PR, `vue-tsc` and test builds are executed.
- **Release Pipeline:**
  You can release a new version for all OSs with a single command:
  ```bash
  pnpm run release
  ```
  This will automatically bump the version, create a Git Tag, and trigger GitHub Actions to build and publish `.exe`, `.dmg`, and `.AppImage` files to GitHub Releases.
