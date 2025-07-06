# PUSS-IN-BOOTS: Memory Card Game

A web-based memory card game inspired by the movie "Puss in Boots". Built with **Phaser** for game logic, **React** for UI, and **Vite** for fast development and build.

## Features

- Memory card matching gameplay with animated effects
- Character carousel and quiz scenes
- Background music and sound effects
- Responsive design for desktop and mobile
- Video and image assets from the movie

## Folder Structure

```
PUSS-IN-BOOTS/
├── public/
│   └── assets/         # All images, audio, and video assets
├── src/
│   ├── scenes/         # Phaser game scenes (MemoryCardScene, EndScene, etc.)
│   ├── App.jsx         # React entry point
│   └── main.jsx        # App bootstrap
├── index.html          # Main HTML file
├── package.json        # Project dependencies
└── vite.config.js      # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or newer recommended)
- npm

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the game in your browser.

### Build for production

```bash
npm run build
```

The output will be in the `dist/` folder. Deploy the contents of `dist/` to your static web server.

## Deployment Notes

- All static assets (images, audio, video) must be referenced as `assets/...` in your Phaser code, **not** `public/assets/...`.
- On mobile browsers, background music will only play after a user gesture (tap/click). This is a browser security restriction.

## Troubleshooting

- **Images or audio not loading after deploy:**
  - Check that asset paths in your code use `assets/` (not `public/assets/`).
  - Ensure the `assets/` folder is present in your deployed `dist/` directory.
  - Filenames are case-sensitive on most servers.
- **No background music on mobile:**
  - Music must be started in a user interaction handler (e.g., button click), not automatically.

## Credits

- Game logic: Phaser
- UI: React
- Build tool: Vite
- Assets: DreamWorks "Puss in Boots" (for educational/demo use only)

---

For questions or contributions, please open an issue or pull request.
