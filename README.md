# 🎵 PitchTrainer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy](https://github.com/andtii/pitch-trainer/actions/workflows/deploy.yml/badge.svg)](https://github.com/andtii/pitch-trainer/actions/workflows/deploy.yml)

A real-time pitch training app that helps you improve your singing accuracy using your microphone. Built with Vue 3 and the Web Audio API.

**[▶ Live Demo](https://andtii.github.io/pitch-trainer/)**

## Features

- **🎤 Free Play** — Pick or randomize a target note, sing it, and get instant visual feedback on pitch accuracy via a meter and graph.
- **🎵 Interval Training** — Learn to identify and sing musical intervals. Includes both ear-identification and sing-along modes.
- **🎹 Scale Training** — Practice singing scales step by step with auto-advance when you hit the right pitch. Supports major, minor, and other scale types in any key.
- **👂 Ear Training** — Hear a note and guess which one it is. Three difficulty levels: natural notes only, chromatic, or free-form input.

## Tech Stack

- [Vue 3](https://vuejs.org/) with `<script setup>` and Composition API
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for development and bundling
- [Pinia](https://pinia.vuejs.org/) for state management
- [Vue Router](https://router.vuejs.org/) for client-side routing
- Web Audio API for pitch detection (autocorrelation) and tone synthesis

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## Browser Requirements

- **Google Chrome** is recommended for the best Web Audio API and microphone support.
- Microphone access is required for pitch detection features.
- A modern browser with Web Audio API support (Chrome, Edge, Firefox, Safari 15+).

## License

This project is licensed under the [MIT License](LICENSE).
