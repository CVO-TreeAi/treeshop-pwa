# TreeAI Deployment Guide

## 🚀 Vercel Deployment Instructions

### Prerequisites
1. Vercel account linked to your GitHub
2. Google Cloud Console project with APIs enabled
3. Convex account with deployed backend

### Step 1: Deploy to Vercel

1. **Connect to Vercel:**
   ```bash
   # Install Vercel CLI (if not already installed)
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy the project
   vercel --prod
   ```

2. **Configure Domain:**
   - Set custom domain to `treeai.app` in Vercel dashboard
   - Update DNS records as instructed by Vercel

### Step 2: Environment Variables

Configure these environment variables in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=https://treeai.app
NEXTAUTH_SECRET=<generate-secure-secret>

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-from-google-cloud-console
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-google-cloud-console

# Google APIs
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-from-google-cloud-console

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=your-convex-deployment-url.convex.site
```

### Step 3: Update Google Cloud Console

1. **OAuth Consent Screen:**
   - Add `https://treeai.app` to authorized domains

2. **OAuth Client Configuration:**
   - Add authorized redirect URIs:
     - `https://treeai.app/api/auth/callback/google`
   - Add authorized JavaScript origins:
     - `https://treeai.app`

3. **Google Maps API:**
   - Add `https://treeai.app` to website restrictions
   - Remove `http://localhost:3000` from restrictions (production only)

### Step 4: Convex Configuration

Update Convex deployment URL in production:
```bash
# If needed, deploy Convex to production
npx convex deploy --cmd-url-var NEXT_PUBLIC_CONVEX_URL
```

### Step 5: Test Deployment

1. **Verify Core Features:**
   - [ ] Authentication (Google OAuth)
   - [ ] Navigation between all sections
   - [ ] Customer management
   - [ ] Work orders
   - [ ] Route optimization
   - [ ] Proposals system

2. **Test APIs:**
   - [ ] Google Maps address validation
   - [ ] Route optimization
   - [ ] Address geocoding
   - [ ] Distance calculations

## 🌟 Git Repository Structure Plan

### Branch Strategy
```
main (production/live)
├── dev (development)
├── backup-main (production backup)
└── backup-dev (development backup)
```

### Workflow
1. **Development:** Work on `dev` branch
2. **Testing:** Thoroughly test on `dev` before merging
3. **Production:** Merge `dev` → `main` for production deployment
4. **Backups:** Regularly update backup branches

### Branch Protection Rules
- `main`: Require pull request reviews, no direct pushes
- `dev`: Allow direct pushes for active development
- Backup branches: Protected, manual updates only

## 📁 Project Structure

```
treeshop-pwa/
├── src/
│   ├── app/                 # Next.js 15 App Router
│   │   ├── api/            # Server-side API routes
│   │   │   ├── auth/       # NextAuth.js authentication
│   │   │   ├── crew/       # Crew tracking APIs
│   │   │   └── maps/       # Google Maps APIs
│   │   ├── auth/           # Authentication pages
│   │   └── page.tsx        # Main application
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── cards/         # Data display cards
│   │   ├── common/        # Shared components
│   │   ├── layout/        # Layout components
│   │   ├── modals/        # Modal dialogs
│   │   ├── operations/    # Operations management
│   │   ├── ui/           # UI components
│   │   └── views/        # Main view components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   └── utils/            # Utility functions
├── convex/               # Convex backend schema
├── public/               # Static assets
├── .env.example          # Environment template
├── vercel.json          # Vercel configuration
└── DEPLOYMENT.md        # This file
```

## 🔧 Key Features Implemented

### ✅ Core Business Management
- **Customer Intelligence:** Comprehensive customer profiles with property data
- **Work Orders:** Complete job management with time tracking
- **Proposals:** Line-item pricing engine with TreeScore integration
- **Invoicing:** Automated billing system
- **Operations:** Employee directory, equipment tracking

### ✅ Google Maps Integration (Phase 1)
- **Route Optimization:** Multi-job route planning with traffic data
- **Address Validation:** Secure server-side geocoding
- **Crew Tracking:** Real-time location monitoring
- **Distance Calculations:** Travel time and cost estimation

### ✅ Advanced Features
- **Category Time Tracking:** 15+ business categories for accurate PpH
- **Workflow Automation:** Automatic project stage progression
- **AI Calendar:** Predictive scheduling with confidence levels
- **TreeScore Formula:** Height × Canopy × 2 × DBH/12 calculations

### ✅ Security & Performance
- **Server-side API Security:** All Google API keys protected
- **Google OAuth:** Secure authentication
- **PWA Ready:** Service worker for offline capability
- **Optimized Build:** Production-ready with proper caching

## 🎯 Next Development Phases

### Phase 2: Communication & Customer APIs
- Gmail integration for customer communication
- Google Calendar for appointment scheduling
- Google Drive for document storage

### Phase 3: Workflow Automation APIs
- Automated email sequences
- Calendar-based workflow triggers
- Document generation automation

### Phase 4: Advanced Intelligence
- Weather API integration
- Predictive maintenance scheduling
- Advanced route optimization with multiple constraints

## 🔐 Security Considerations

1. **Environment Variables:** Never commit sensitive data
2. **API Keys:** Server-side only, never expose client-side
3. **OAuth Scopes:** Request minimal necessary permissions
4. **HTTPS:** Force HTTPS in production
5. **CORS:** Restrict API access to authorized domains

## 📊 Performance Monitoring

- **Core Web Vitals:** Monitor LCP, FID, CLS
- **API Response Times:** Track Google Maps API performance
- **Error Rates:** Monitor authentication and API failures
- **User Analytics:** Track feature usage and workflow efficiency

---

**Ready for Production Deployment** ✅

The TreeAI application is now fully prepared for Vercel deployment with comprehensive Google Maps integration, secure authentication, and robust business management features.