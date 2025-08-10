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

### Backend - Microservices & Port Configuration
- **Main Trading Platform**: Node.js with Express.js (Port 5000) - Unified platform serving frontend, trading bot, AI predictions, mining management, and withdrawal system
- **Mining Control Center**: Integrated service within main platform for real-time mining rig monitoring
- **Social Justice Platform**: Integrated service within main platform for community impact project management and token allocation  
- **WebSocket Services**: Real-time mining data and trading updates on same port as main platform
- **Cross-Service Communication**: Internal module communication and RESTful APIs
- **Language**: TypeScript across all services

### Port Allocation & Network Configuration
- **Primary Application**: Port 5000 (Express server + Vite frontend)
- **Mining Rig Connections**: 
  - AntMiner S19 Pro #001: IP 192.168.1.101 (connects to pools via stratum protocol)
  - WhatsMiner M30S+ #002: IP 192.168.1.102 (connects to pools via stratum protocol)  
  - AntMiner S19 #003: IP 192.168.1.103 (connects to pools via stratum protocol)
  - AvalonMiner 1246 #004: IP 192.168.1.104 (connects to pools via stratum protocol)
  - AntMiner S17 Pro #005: IP 192.168.1.105 (connects to pools via stratum protocol)
- **Mining Pool Endpoints**:
  - KloudBugs Cafe Pool: stratum.kloudbugs.cafe:4444 (simulated)
  - BTC Backup Pool: stratum.btcpool.backup:3333 (simulated)
  - TERA Social Justice Pool: stratum.terajustice.org:4444 (simulated)
- **Database**: PostgreSQL via Neon Database (external connection)
- **External APIs**: Kraken WebSocket (external connection)

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

### Mining & Withdrawal System
- **Mining Pool Integration**: Real-time connection monitoring to multiple pools (KloudBugs Cafe, BTC Backup, TERA Justice)
- **Withdrawal Management**: Comprehensive system using Drizzle ORM for secure withdrawal processing
- **Supported Cryptocurrencies**: Bitcoin (BTC), Ethereum (ETH), TERA Token
- **Blockchain Integration**: Ethers.js handles ALL cryptocurrency transactions without requiring local blockchain nodes
- **External API Providers**: 
  - Bitcoin: BlockCypher, Blockstream APIs for transaction broadcasting
  - Ethereum: Infura, Alchemy providers for network interaction
  - TERA Token: Custom RPC endpoints for TERA blockchain network
- **No Local Nodes Required**: System uses external API providers instead of Bitcoin Core or full blockchain nodes
- **Withdrawal Features**:
  - Real-time pool balance tracking across all connected rigs
  - Automated withdrawal request validation and processing
  - Multi-signature wallet integration via ethers.js for transaction signing
  - Auto-withdrawal thresholds with user-configurable settings
  - 2FA security requirements and email/SMS notifications
  - Transaction status tracking with blockchain hash verification
  - Pool-specific withdrawal policies and fee structures
  - Lightweight transaction handling with instant startup (no blockchain sync required)
- **Database Schema**: Drizzle ORM managing withdrawals, balances, pool connections, and mining rig data
- **Security**: Wallet address validation, minimum/maximum withdrawal limits, approval workflows
- **Production Requirements**: API keys for external providers, secure key storage, rate limiting

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