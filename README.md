# Screwdle - 3D Word Game

A modern word guessing game built with React, Three.js, and Bun.

## Features

- 🎯 **Classic Mode**: Play with any 5-letter word
- 📅 **Daily Mode**: One word per day for everyone (with 3D scene)
- 🎮 **Practice Mode**: Hone your skills with hints
- 🎨 **3D Graphics**: Interactive 3D scenes using React Three Fiber
- 📱 **Responsive Design**: Works on all devices
- ⚡ **Fast**: Built with Bun for optimal performance

## Tech Stack

- **Frontend**: React 19, TypeScript
- **3D Graphics**: React Three Fiber, Three.js
- **Styling**: Tailwind CSS
- **Runtime**: Bun
- **Deployment**: Vercel

## Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Deployment

This project is configured for deployment on Vercel with Bun:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Bun configuration
3. The app will be deployed with the following settings:
   - **Build Command**: `bun run build`
   - **Output Directory**: `dist`
   - **Install Command**: `bun install`

## Project Structure

```
src/
├── App.tsx          # Home page component
├── Daily.tsx        # Daily game with 3D scene
├── Router.tsx       # Client-side routing
├── frontend.tsx     # React app entry point
├── index.tsx        # Bun server
├── index.html       # HTML template
└── index.css        # Custom styles
```

## 3D Scene Controls

- **Left click + drag**: Rotate view
- **Right click + drag**: Pan view
- **Scroll**: Zoom in/out
- **Hover**: Interactive elements respond to mouse

## License

MIT