import { Home, BookOpen, Users, BarChart3, User as UserIcon } from 'lucide-react';
import { Logo } from './Logo';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useGamification } from '@/hooks/useGamification';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';

const navItems = [
  { icon: Home, label: 'Início', path: '/dashboard' },
  { icon: BookOpen, label: 'Diário', path: '/diary' },
  { icon: Users, label: 'Comunidade', path: '/community' },
  { icon: BarChart3, label: 'Progresso', path: '/progress' },
  { icon: UserIcon, label: 'Perfil', path: '/profile' },
];

export function AppSidebar() {
  const { user, profile } = useAuth();
  const { stats } = useGamification();

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarContent>
        {/* Logo */}
        <div className="p-6 pb-4">
          <Logo size="sm" />
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.path} 
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-accent"
                      activeClassName="bg-accent/50 text-primary font-semibold"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter className="p-4 border-t border-border/50">
        <NavLink 
          to="/profile"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
        >
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {profile?.full_name?.[0] || user?.email?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {profile?.full_name || user?.email?.split('@')[0] || 'Usuário'}
            </p>
            {stats && (
              <div className="flex items-center gap-1.5">
                <Badge 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0 h-4 bg-gradient-primary text-white border-0"
                >
                  Nível {stats.current_level}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {stats.current_cycle_xp} XP
                </span>
              </div>
            )}
          </div>
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
