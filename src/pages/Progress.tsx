import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { Flame, Target, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// Generate mock heatmap data (GitHub style)
const generateHeatmapData = () => {
  const data = [];
  const today = new Date();
  for (let i = 0; i < 91; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (90 - i));
    const success = Math.random() > 0.3;
    const intensity = success ? Math.floor(Math.random() * 4) + 1 : 0;
    data.push({ date, success, intensity });
  }
  return data;
};

const heatmapData = generateHeatmapData();

const stats = [
  { icon: Flame, label: 'Sequência atual', value: '12 dias', color: 'text-secondary' },
  { icon: Target, label: 'Meta semanal', value: '5/7', color: 'text-primary' },
  { icon: Trophy, label: 'Melhor sequência', value: '28 dias', color: 'text-yellow-500' },
  { icon: TrendingUp, label: 'Taxa de sucesso', value: '87%', color: 'text-secondary' },
];

export default function Progress() {
  // Group data into weeks
  const weeks: typeof heatmapData[] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-20">
      <Navbar />
      
      <main className="px-4 py-6">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold text-foreground">Progresso</h1>
            <p className="text-muted-foreground">Seus últimos 90 dias</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="p-4 rounded-2xl bg-card border border-border"
              >
                <stat.icon className={cn("h-5 w-5 mb-2", stat.color)} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-2xl bg-card border border-border"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Contribution Graph
            </h2>
            
            <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <motion.div
                      key={`${weekIndex}-${dayIndex}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 + weekIndex * 0.02 + dayIndex * 0.01 }}
                      className={cn(
                        "w-4 h-4 rounded-sm transition-colors",
                        day.intensity === 0 && "bg-muted",
                        day.intensity === 1 && "bg-secondary/30",
                        day.intensity === 2 && "bg-secondary/50",
                        day.intensity === 3 && "bg-secondary/70",
                        day.intensity === 4 && "bg-secondary"
                      )}
                      title={`${day.date.toLocaleDateString('pt-BR')} - ${day.success ? 'Jejum completo' : 'Não completou'}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
              <span>Menos</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <div className="w-3 h-3 rounded-sm bg-secondary/30" />
                <div className="w-3 h-3 rounded-sm bg-secondary/50" />
                <div className="w-3 h-3 rounded-sm bg-secondary/70" />
                <div className="w-3 h-3 rounded-sm bg-secondary" />
              </div>
              <span>Mais</span>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-2xl bg-card border border-border"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Conquistas recentes
            </h2>
            
            <div className="space-y-3">
              {[
                { emoji: '🔥', title: 'Primeira semana', description: '7 dias consecutivos' },
                { emoji: '⚡', title: 'Madrugador', description: '5 jejuns começando antes das 8h' },
                { emoji: '🧘', title: 'Mente calma', description: '3 pausas de respiração' },
              ].map((achievement, index) => (
                <div
                  key={achievement.title}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                >
                  <span className="text-2xl">{achievement.emoji}</span>
                  <div>
                    <p className="font-medium text-foreground">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
