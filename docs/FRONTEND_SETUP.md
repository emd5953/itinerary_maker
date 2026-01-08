# aSpot Frontend Setup

## 🎨 Beautiful Landing Page & Dashboard

I've created a stunning frontend that perfectly matches your mobile app's aesthetic! Here's what's been built:

### ✨ **What's Included:**

**🏠 Landing Page:**
- Beautiful hero section with mobile app preview
- Matches your aSpot color scheme (light blue/teal)
- Responsive design that looks great on all devices
- Feature showcase with icons and descriptions
- Call-to-action sections
- Professional footer

**📱 Dashboard:**
- Clean, modern interface for authenticated users
- Trip management cards
- Quick action buttons
- Personalized recommendations
- User profile integration

**🔐 Authentication:**
- Clerk integration for seamless sign-in/sign-up
- Custom styled auth pages
- Protected routes with middleware
- User profile management

### 🚀 **Getting Started:**

1. **Update your Clerk keys** in `frontend/.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_actual_publishable_key
   CLERK_SECRET_KEY=your_actual_secret_key
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Visit your app:**
   - Landing page: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard (requires sign-in)

### 🎨 **Design Features:**

**Color Palette:**
- Primary: `#7dd3fc` (aSpot blue)
- Light: `#a8e6f0` (Light blue)
- Dark: `#0369a1` (Dark blue for contrast)

**Typography:**
- Inter font family for clean, modern look
- Consistent spacing and sizing
- Perfect readability

**Components:**
- Custom aSpot logo with map pin icon
- Reusable button styles (primary/secondary)
- Card components with soft shadows
- Gradient backgrounds matching your mobile app

### 📱 **Mobile App Integration:**

The landing page features a beautiful mobile app preview that showcases:
- Your exact aSpot logo and branding
- Day navigation tabs (Day 1, Day 2, Day 3)
- Search destinations interface
- Recommended activities grid
- Map preview section
- Bottom navigation (Home, Explore, Trips, Profile)

### 🔧 **Technical Stack:**

- **Next.js 16** - Latest React framework
- **Tailwind CSS** - Utility-first styling
- **Clerk** - Authentication and user management
- **Lucide React** - Beautiful icons
- **TypeScript** - Type safety

### 🌟 **Key Pages:**

1. **Landing Page** (`/`) - Marketing site with mobile preview
2. **Dashboard** (`/dashboard`) - User's trip management hub
3. **Sign In** (`/sign-in`) - Custom styled authentication
4. **Sign Up** (`/sign-up`) - User registration flow

### 🔗 **Microservices Integration:**

The frontend is ready to connect to your microservices architecture:
- API service layer in `app/lib/api.ts`
- Authenticated requests with Clerk tokens
- User profile management
- Health check endpoints
- API Gateway integration at `http://localhost:8080`

### 🎯 **Next Steps:**

1. **Add your real Clerk keys** to see authentication in action
2. **Customize the content** to match your specific features
3. **Add more pages** as you build out the itinerary features
4. **Connect to your microservices** for real data through the API Gateway

The frontend perfectly captures the clean, modern aesthetic of your mobile app while providing a professional web experience! 🚀