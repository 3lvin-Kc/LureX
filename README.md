
# PhishGuard - Frontend-Only Phishing Simulation Platform

A comprehensive phishing simulation platform built with React, TypeScript, and Tailwind CSS. This is currently a frontend-only implementation with mock data for demonstration and development purposes.

## Features

- **Campaign Management**: Create and manage phishing simulation campaigns
- **Email Templates**: Design and customize phishing email templates
- **Phishing Pages**: Create realistic phishing landing pages
- **Target Lists**: Manage employee contact lists for simulations
- **Analytics & Reporting**: Track campaign performance and user interactions
- **Security Training**: Integrated awareness training modules

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/ui
- **State Management**: TanStack Query
- **Routing**: React Router
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd phishguard
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Current State

This application is currently **frontend-only** with mock data implementations. All backend integrations have been removed and the application operates entirely with simulated functionality for:

- User authentication (mock login)
- Data storage (local state/localStorage)
- Email delivery (simulated)
- Analytics (mock data)

## MVP Development

See `current2.md` for detailed MVP requirements and development roadmap to transform this into a production-ready application.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── lib/                # Library configurations
└── assets/             # Static assets
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

This is a frontend-only demonstration. For production deployment, backend services will need to be implemented according to the MVP specification in `current2.md`.
