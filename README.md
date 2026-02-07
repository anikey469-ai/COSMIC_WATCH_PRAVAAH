
# Cosmic Watch - NEO Monitoring Platform

A high-fidelity Near-Earth Object (NEO) monitoring dashboard powered by NASA NeoWs API.

## Features
- **Real-time NEO Feed**: Live tracking of asteroids passing near Earth.
- **Risk Analysis Engine**: Custom scoring (0-100) based on hazard status, size, and velocity.
- **3D Visualization**: Interactive Three.js scene showing Earth and orbital paths.
- **Global Chat**: Real-time communication for verified observers (Socket.io).
- **Watchlist**: Track specific objects and receive simulated hazard alerts.

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Three.js.
- **Styling**: Space Theme (Glassmorphism, Dark Mode).
- **Backend (Reference)**: Express, Node.js, Prisma ORM (Architecture defined in logic).
- **Data**: NASA JPL NeoWs (Near Earth Object Web Service).

## Setup
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Start development server: `npm run dev`.
4. (Optional) Run with Docker: `docker-compose up`.

## Risk Score Formula
- **Hazard (40%)**: Automatic 40 points if NASA classifies object as PHA.
- **Diameter (30%)**: Scaled based on maximum estimated size (>1km = 30pts).
- **Proximity (30%)**: Scaled based on miss distance (<1M km = 30pts).
