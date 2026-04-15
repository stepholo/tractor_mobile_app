# 🚜 Farm Tractor Ledger

A comprehensive mobile and web application for farm tractor operators to manage operations, track profitability, and optimize equipment utilization in Kenya.

## 📱 Overview

**Farm Tractor Ledger** is a full-stack application built with Next.js, TypeScript, Firebase, and Capacitor that enables tractor owners and operators to:
- Track daily operations with detailed metrics
- Monitor profitability by equipment and timeframe
- Manage rental fees and operational expenses
- View real-time analytics and performance dashboards
- Access the app on web and mobile (iOS/Android)

Perfect for tractor operators in Kenya who need data-driven insights to optimize their business operations.

---

## ✨ Key Features

### 📊 Dashboard & Analytics
- **Real-time Performance Metrics**: View revenue collected, net profit, rental value, and total acres worked
- **Profit by Implement**: Bar charts showing profitability breakdown by equipment type
- **Recent Operations**: Quick view of latest 5 operations with dates and revenue
- **Efficiency Analysis**: Monitor profit margins per acre and average productivity
- **Engine Usage Tracking**: Circular progress indicator showing engine hours vs. maintenance cycles

### 🔧 Operations Management
- Record tractor operations with implement type, acreage, and revenue
- Track expenses against revenue for accurate profit calculation
- Organize operations by date with quick-access recent history
- Store operational data persistently with Firebase

### 👤 User Profile & Onboarding
- Customize tractor model and owner information
- Profile completion checklist for feature access
- Settings page for account and equipment management
- Kenya Shilling (KSh) currency support built-in

### 📱 Cross-Platform Capability
- **Web**: Full-featured web dashboard accessible from any browser
- **iOS**: Native iOS app via Capacitor
- **Android**: Native Android app via Capacitor
- Responsive design optimized for all screen sizes

### 🤖 AI Integration
- Powered by Google Genkit for intelligent insights
- AI-assisted data analysis and recommendations

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 15.5, React 19, TypeScript |
| **Styling** | Tailwind CSS, Radix UI Components |
| **Mobile** | Capacitor 8.2 (iOS, Android) |
| **Backend** | Firebase 11.9, Google Cloud |
| **AI/ML** | Google Genkit 1.28, @genkit-ai/google-genai |
| **Forms** | React Hook Form, Zod Validation |
| **Charts** | Recharts 2.15 |
| **Icons** | Lucide React |
| **Utilities** | date-fns, class-variance-authority |
| **Dev Tools** | TypeScript, ESLint, Turbopack |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **npm** or **yarn**: Package manager
- **Firebase Project**: Set up at [firebase.google.com](https://firebase.google.com)
- **Capacitor CLI**: For mobile builds (optional)

### Installation
    ```bash
    # 1. Clone the repository
    git clone https://github.com/stepholo/tractor_mobile_app.git
    cd tractor_mobile_app

    # 2. Install dependencies
    npm install
    # or
    yarn install

    # 3. Configure Firebase Create a .env.local file with your Firebase credentials:
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

    # 4. Start development server
    npm run dev
    # or
    yarn dev

    # Open http://localhost:9002 in your browser
    ```

### Available Script
    ```bash
    # Development
    npm run dev                    # Start dev server with Turbopack on port 9002
    npm run genkit:dev           # Start Genkit AI server
    npm run genkit:watch         # Start Genkit with file watching

    # Production
    npm run build                # Build for production (Next.js export)
    npm start                    # Start production server

    # Code Quality
    npm run lint                 # Run ESLint
    npm run typecheck            # Type-check TypeScript without emitting

    # Maintenance
    npm run patch:watch          # Monitor for patch-package updates
    ```

### 📱 Mobile Deployment - Android
    ```bash
    # 1. Sync Capacitor with Android
    npx cap sync android
    npx cap open android

    # 2. Build APK/AAB
    # Development APK
    cd android && ./gradlew assembleDebug

    # Production AAB for Play Store
    cd android && ./gradlew bundleRelease

    # 3. Configure Android

    Update app ID in capacitor.config.json if needed
    Configure signing keys for production
    ```

## 📊 Usage Guide

### Dashboard View
The main dashboard displays:

    - Owner Name & Tractor Model from your profile
    - 4 Key Metrics: Revenue, Net Profit, Rental Value, Total Acres
    - Profit by Implement Chart: Visual breakdown of profitability
    - Recent Operations: Latest work records
    - Efficiency Indicators: Margins analysis and engine hours tracking

### Creating an Operation
1. Navigate to Operations section
2. Fill in:
    - Implement type (e.g., Plowing, Discing)
    - Date of operation
    - Acres covered
    - Revenue collected
    - Expenses incurred
    - System automatically calculates net profit

### Managing Profile
    1. Go to Settings
    2. Update tractor model and owner details
    3. Complete onboarding checklist to unlock all features

## Analyzing Performance
    - Compare profitability across different implements
    - Track profit margins per acre
    - Monitor maintenance needs via engine hours
    - Identify trends in revenue and expenses

## 🔌 API & Data Management
### State Management
The app uses a custom hook useTractorData() to manage:

    - operations: Array of operation records
    - service: Equipment service metrics (engine hours)
    - profile: User and tractor information
    - isLoaded: Loading state for UI

## 🔧 Configuration
### Tailwind CSS
Customized via tailwind.config.ts:

Primary color: Orange (#FF7F00) for tractor branding
Font: Custom headline and body fonts
Responsive breakpoints optimized for mobile

### Next.js
Export mode enabled for Capacitor:

output: 'export' for static generation
Image optimization disabled for mobile compatibility
TypeScript errors ignored (use npm run typecheck separately)

### Capacitor
Mobile app identifier: com.github.stepholo.tractor_mobile_app Web directory: out/ (generated from Next.js build)

## 📈 Roadmap
 - Offline Support: Sync operations when connection restored
 - GPS Integration: Auto-track location of operations
 - Photo Capture: Attach photos to operations
 - Invoice Generation: Create billing from operations
 - Multi-language: Support for Swahili and other languages
 - Advanced Analytics: Predictive maintenance, ROI analysis
 - Team Collaboration: Share operations with workers
 - Payment Integration: Direct payment via M-Pesa

### 📄 License
This project is open source. See LICENSE file for details.

### 👥 Contributing
Contributions are welcome! Please:

- Fork the repository
- Create a feature branch (git checkout -b feature/amazing-feature)
- Commit changes (git commit -m 'Add amazing feature')
- Push to branch (git push origin feature/amazing-feature)
- Open a Pull Request

### 📧 Support
For issues, questions, or feedback:

Open an issue on GitHub
Check existing documentation in /docs