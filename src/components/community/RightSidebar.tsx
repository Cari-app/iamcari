import { Trophy, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Mock data - replace with real data from Supabase
const topUsers = [
  { id: '1', name: '@user1234', level: 15, xp: 12500, rank: 1 },
  { id: '2', name: '@fitness99', level: 14, xp: 11200, rank: 2 },
  { id: '3', name: '@health_hero', level: 13, xp: 10800, rank: 3 },
  { id: '4', name: '@wellness_pro', level: 12, xp: 9500, rank: 4 },
  { id: '5', name: '@fit_journey', level: 11, xp: 8900, rank: 5 },
];

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1: return 'text-yellow-500';
    case 2: return 'text-gray-400';
    case 3: return 'text-amber-600';
    default: return 'text-muted-foreground';
  }
};

export function RightSidebar() {
  return (
    <aside className="w-80 sticky top-20 h-fit">
      <Card className="glass border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 5 Ranking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className={`text-xl font-bold w-6 text-center ${getRankColor(user.rank)}`}>
                {user.rank}
              </div>
              <Avatar className="h-9 w-9 border border-border/50">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} />
                <AvatarFallback className="bg-muted text-xs">
                  {user.name[1]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <div className="flex items-center gap-1.5">
                  <Badge 
                    variant="secondary" 
                    className="text-[9px] px-1.5 py-0 h-3.5 bg-gradient-primary text-white border-0"
                  >
                    Nv{user.level}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {user.xp} XP
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Trending Challenges */}
      <Card className="glass border-border/50 mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-teal-500" />
            Desafios em Alta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer">
            <p className="font-medium text-sm mb-1">#21DiasDeFoco</p>
            <p className="text-xs text-muted-foreground">1.2k participantes</p>
          </div>
          <div className="p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer">
            <p className="font-medium text-sm mb-1">#HidratacaoTotal</p>
            <p className="text-xs text-muted-foreground">892 participantes</p>
          </div>
          <div className="p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer">
            <p className="font-medium text-sm mb-1">#JejumIntermitente</p>
            <p className="text-xs text-muted-foreground">756 participantes</p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
