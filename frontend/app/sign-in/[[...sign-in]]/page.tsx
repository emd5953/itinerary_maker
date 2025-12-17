import { SignIn } from '@clerk/nextjs';
import Logo from '../../components/Logo';

export default function SignInPage() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center text-white mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/80">Sign in to continue your travel planning</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-aspot hover:bg-aspot-dark',
                card: 'shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}