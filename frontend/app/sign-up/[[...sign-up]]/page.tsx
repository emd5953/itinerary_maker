import { SignUp } from '@clerk/nextjs';
import Logo from '../../components/Logo';

export default function SignUpPage() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center text-white mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Join aSpot</h1>
          <p className="text-white/80">Start planning amazing adventures today</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <SignUp 
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