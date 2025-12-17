import { MapPin } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 40,
    xl: 60
  };

  return (
    <div className={`flex items-center gap-1 font-bold text-gray-900 ${sizeClasses[size]} ${className}`}>
      <div className="relative">
        <MapPin 
          size={iconSizes[size]} 
          className="text-aspot-dark" 
          fill="currentColor"
        />
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-aspot rounded-full opacity-60"></div>
      </div>
      <span className="tracking-tight">
        a<span className="text-aspot-dark">Spot</span>
      </span>
    </div>
  );
}