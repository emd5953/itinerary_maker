# aSpot Frontend

This is the frontend application for aSpot, built with Next.js 15, React 19, and TypeScript.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **NextAuth.js** - Authentication

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
├── redux/                 # Redux store and slices
│   ├── store.ts          # Store configuration
│   └── slices/           # Redux slices
├── public/               # Static assets
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Development

### Adding New Pages

With Next.js App Router, create new pages by adding files to the `app/` directory:

```
app/
├── page.tsx              # Home page (/)
├── about/
│   └── page.tsx          # About page (/about)
└── dashboard/
    ├── page.tsx          # Dashboard (/dashboard)
    └── settings/
        └── page.tsx      # Settings (/dashboard/settings)
```

### State Management

The application uses Redux Toolkit for state management. Add new slices to the `redux/slices/` directory and configure them in `redux/store.ts`.

### Styling

The application uses Tailwind CSS for styling. Customize the theme in `tailwind.config.ts`.

### Authentication

Authentication is handled by NextAuth.js. Configure providers and callbacks in `app/api/auth/[...nextauth]/route.ts`.

## Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Docker

The frontend can be containerized using the Dockerfile in the `docker/` directory:

```bash
# Build Docker image
docker build -f docker/Dockerfile.frontend -t aspot-frontend .

# Run container
docker run -p 3000:3000 aspot-frontend
```

## Contributing

1. Follow the established code organization patterns
2. Use TypeScript for all new components
3. Follow the component naming conventions
4. Ensure all components are properly typed
5. Add appropriate error handling

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [NextAuth.js Documentation](https://next-auth.js.org/)