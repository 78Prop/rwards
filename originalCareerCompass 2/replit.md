# TERA CORE - KLOUD BUGS PRO

## Overview
TERA CORE - KLOUD BUGS PRO is an advanced AI-powered cryptocurrency and social impact platform with a microservices architecture and cosmic-themed interface. It combines real-time Bitcoin trading, mining operation management, legal research AI (TERJustice AI), community cafe management, TERA token governance for social justice funding, and platform administration into a unified system. The platform's core vision is to automate crypto operations, support legal justice initiatives, and foster community impact through a self-sustaining ecosystem where mining profits fund social projects via the TERA token.

## User Preferences
Preferred communication style: Simple, everyday language.
AI Strategy: Building own custom AI models rather than using third-party providers like OpenAI/Anthropic.
Business Focus: Crypto mining operations, platform management, and social justice token for community impact projects.
Branding: Always include "TERA CORE - KLOUD BUGS PRO" in headers and titles.
UI Consistency: Main platform UI should stay the same unless a new app is loaded that completely replaces the interface.
Development Approach: Work step-by-step carefully, especially with Python miners that may crash the app.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript and Vite
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom cosmic theme variables
- **State Management**: TanStack Query
- **Real-time Communication**: WebSocket hooks
- **Charts**: Chart.js for financial visualizations
- **Routing**: Wouter

### Backend - Microservices
- **Main Trading Platform**: Node.js with Express.js (Port 3000) for Bitcoin trading bot, AI predictions, and portfolio management.
- **Mining Control Center**: Independent Node.js service (Port 3001) for real-time mining rig monitoring.
- **Social Justice Platform**: Dedicated Node.js service (Port 3002) for community impact project management and token allocation.
- **Cross-Service Communication**: RESTful APIs for data exchange.
- **Language**: TypeScript across all services.

### Database
- **Primary Database**: PostgreSQL with Drizzle ORM.
- **Connection**: Neon Database serverless PostgreSQL.
- **Schema**: Structured tables for users, trades, bot settings, and price data.
- **Migrations**: Drizzle Kit for schema management.

### Trading System
- **Market Data**: Kraken API for real-time Bitcoin price feeds.
- **Technical Analysis**: Custom indicators (RSI, MACD, Bollinger Bands, moving averages).
- **AI System**: Modular AI manager supporting multiple custom and integrated AI models with confidence scoring.
- **Risk Management**: Portfolio manager with position sizing, stop-loss, and take-profit mechanisms.

### Authentication & Security
- **Session Management**: Express sessions with PostgreSQL store.
- **API Security**: CORS configuration and request validation.

### Core Architectural Decisions
- **Comprehensive Ecosystem**: Integration of trading, mining, legal AI, community, and token governance.
- **Microservices Architecture**: Ensures independent functionality and scalability.
- **Real-time Data**: Extensive use of WebSockets for live updates across all modules.
- **Custom AI Focus**: Emphasis on building in-house AI models.
- **Modular Design**: Supports integration of new applications and services.
- **UI/UX**: Cosmic-themed visual design with Radix UI and Tailwind CSS for a consistent, branded experience.
- **TERA AI Family**: Dedicated interactive pages and JSON-based configurations for specialized AI systems (e.g., TERA Guardian Core, TERA-Algo AI, TeraMiner AI).

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting.
- **Kraken Exchange**: Cryptocurrency market data provider (via API).

### Libraries and Frameworks
- **@neondatabase/serverless**: Serverless PostgreSQL database connection.
- **drizzle-orm**: Type-safe SQL query builder and ORM.
- **ws**: WebSocket implementation.
- **express**: Web application framework.
- **react**: Frontend UI library.
- **vite**: Build tool.
- **@radix-ui/***: Accessible UI primitives.
- **@tanstack/react-query**: Server state management and caching.
- **tailwindcss**: Utility-first CSS framework.
- **chart.js**: Charting library.
- **date-fns**: Date utility library.
- **typescript**: For static type checking.

### Visual Assets
- **Google Fonts**: Orbitron and Rajdhani.
- **Font Awesome**: Icon library.