# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Laravel)
- `composer dev` - Start development environment (Laravel server, queue worker, logs, and Vite)
- `composer dev:ssr` - Start development with SSR support
- `composer test` - Run PHPUnit tests with config clear
- `php artisan serve` - Start Laravel development server
- `php artisan test` - Run tests
- `php artisan migrate` - Run database migrations
- `php artisan pail` - View application logs in real-time

### Frontend (React + TypeScript)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run build:ssr` - Build with SSR support
- `npm run lint` - Run ESLint with auto-fix
- `npm run types` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Architecture Overview

### Technology Stack
- **Backend**: Laravel 12 with Inertia.js
- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 with Radix UI components
- **Database**: SQLite (development), MySQL (production)
- **Build Tool**: Vite 6
- **Authentication**: Multi-modal (traditional + WebAuthn biometric)

### Key Application Features
This is a Laravel-React marketplace application with:
- User authentication with email verification
- Biometric authentication (WebAuthn)
- House/property listings with status management
- Order management system with buyer/seller workflows  
- Referral system with commission tracking
- User wallet/earnings system
- Profile management with avatar uploads
- Seller application system
- **Calculator Feature**: Advanced betting strategy calculator with dual-mode system (Random/Custom), roadmap generation, and P&L tracking

### Core Models & Relationships
- **User**: Central model with referral system, houses, orders, earnings (buyer/seller/pending_seller types)
- **House**: Property listings with status (available, suspended, sold) - automatically managed by order state
- **Order**: Complex state machine (pending → confirmed → shipped → received → completed) with 12+ possible states
- **OrderMessage**: Communication log between buyers and sellers with action categorization
- **ReferralCommission**: Commission tracking for 10% referral bonuses
- **Earning**: User earnings tracking (house_sale, referral_commission, platform_sale types)
- **UserCredential**: WebAuthn biometric authentication credentials
- **Video**: Video content model with view counts and like functionality

### Frontend Structure
- **Pages**: Organized by feature (auth/, houses/, profile/, settings/)
- **Components**: Reusable UI components with Radix UI primitives
- **Layouts**: Nested layouts (app, auth, settings with sidebars)
- **Hooks**: Custom hooks for appearance, mobile detection, user data
- **Utils**: Utility functions for biometric auth and general helpers

### API Structure
- RESTful APIs under `/api/` prefix
- Authenticated routes require `auth` and `verified` middleware
- Key endpoints: houses, orders, referrals, wallet, profile, settings
- Separate biometric auth endpoints under `/api/biometric/`
- Video API endpoints for content management

### Database Schema
- Uses enum fields for status management (orders, houses)
- Comprehensive migration history showing feature evolution
- Referral system with codes and commission tracking
- User profile fields including social contacts (WeChat, WhatsApp)

### Testing
- PHPUnit configuration with Feature and Unit test suites
- Uses SQLite in-memory database for tests
- Existing tests cover authentication flows and basic functionality

## Development Notes

### Calculator Feature Architecture
The Calculator (`/calculator` route) is a sophisticated betting strategy system with:

**Dual Strategy System:**
- **Random Mode (Default)**: Probabilistic betting with 50.8% B (Banker), 49.2% P (Player)
- **Custom Mode**: User-defined pattern-based strategies with regex matching

**Core Components:**
- **Roadmap Generation**: Baccarat-style grid visualization with collision detection
- **Betting Progression**: Configurable level system with 0-value fallback logic
- **P&L Tracking**: Real-time profit/loss calculation with 5% banker commission
- **Animation System**: Coin flip transition effects during result processing
- **Hidden Mode**: Minimalist UI with randomized grayscale color themes

**State Management:**
- Complex state machine managing betting levels, recommendations, and visual states
- Pattern matching system for custom strategies using regex
- Real-time roadmap updates with position collision handling

**UI Features:**
- Editable betting level grid with click-to-edit functionality
- Modal-based strategy management with add/edit/delete operations
- Responsive design with mobile-first approach
- Dynamic color theming in hidden mode

### Order Status Flow
Orders follow a complex state machine with 12+ states:
**Main Flow**: pending → confirmed → shipped → received → completed
**Alternate States**: rejected, cancelled_by_buyer, cancelled_by_seller, rejected_delivery
**House Auto-Update**: Order status changes automatically update related house status (available ↔ suspended ↔ sold)

### Seller Application System
Users can apply to become sellers with profile validation:
- Requires completed profile (real_name, phone, wechat)
- Three states: buyer → pending_seller → seller
- Profile completeness validation before application submission

### Biometric Authentication (WebAuthn)
Full WebAuthn implementation with:
- Platform authenticator support for passwordless login
- Credential registration, authentication, and management
- Challenge-response verification system via BiometricAuthService

### Referral & Earnings System
- Unique referral codes for each user
- 10% automatic commission on referred user purchases
- Three earning types: house_sale, referral_commission, platform_sale
- Wallet system with platform house buyback option (95% of listing price)

### Database Configuration
- **Development**: SQLite (database/database.sqlite)
- **Production**: MySQL with proper credentials
- **Testing**: In-memory SQLite for test isolation
- Comprehensive migrations with foreign key constraints and proper indexing