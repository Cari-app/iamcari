import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import logoImage from '@/assets/logo-cari.png';

interface AppHeaderProps {
  showAvatar?: boolean;
  centered?: boolean;
  className?: string;
}

export function AppHeader({ showAvatar = true, centered = false, className = '' }: AppHeaderProps) {
  const { profile } = useAuth();

  return (
    <header className={`flex items-center px-4 pb-2 pt-safe-top ${centered ? 'justify-center' : 'justify-between'} ${className}`}>
      <img src={logoImage} alt="FastBurn" className="h-6" />
      {showAvatar && !centered && (
        <Link to="/profile">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-white/20 text-white">
              {profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </Link>
      )}
    </header>
  );
}
