import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ACHIEVEMENTS,
  AchievementTier,
  AchievementData,
  UnlockedAchievement,
  getTierColor,
  getTierBg,
  getTierLabel,
} from '@/lib/achievements';

interface AchievementsTabProps {
  unlockedAchievements: UnlockedAchievement[];
  achievementData: AchievementData | null;
  loading: boolean;
}

const TIERS: AchievementTier[] = ['bronze', 'silver', 'gold'];

const CATEGORY_LABELS: Record<string, string> = {
  fasting: '🔥 Jejum',
  water: '💧 Hidratação',
  weight: '⚖️ Peso',
};

export function AchievementsTab({ unlockedAchievements, achievementData, loading }: AchievementsTabProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  const unlockedSet = new Set(unlockedAchievements.map(u => `${u.key}:${u.tier}`));
  const totalPossible = ACHIEVEMENTS.length * 3;
  const totalUnlocked = unlockedAchievements.length;

  const categories = ['fasting', 'water', 'weight'] as const;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="rounded-2xl bg-white dark:bg-card shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(132,204,22,0.08)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.12)] p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-foreground text-base">Suas Conquistas</h3>
          <span className="text-xs font-semibold text-lime-600 dark:text-lime-400">
            {totalUnlocked}/{totalPossible}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-lime-500 to-green-500 transition-all duration-500"
            style={{ width: `${(totalUnlocked / totalPossible) * 100}%` }}
          />
        </div>
      </div>

      {/* Categories */}
      {categories.map(category => {
        const catAchievements = ACHIEVEMENTS.filter(a => a.category === category);

        return (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground px-1">
              {CATEGORY_LABELS[category]}
            </h4>

            {catAchievements.map((achievement, idx) => {
              const value = achievementData ? achievement.evaluate(achievementData) : 0;
              const Icon = achievement.icon;

              // Find highest unlocked tier
              let highestTier: AchievementTier | null = null;
              for (const tier of [...TIERS].reverse()) {
                if (unlockedSet.has(`${achievement.key}:${tier}`)) {
                  highestTier = tier;
                  break;
                }
              }

              // Find next tier to unlock
              let nextTier: AchievementTier | null = null;
              for (const tier of TIERS) {
                if (!unlockedSet.has(`${achievement.key}:${tier}`)) {
                  nextTier = tier;
                  break;
                }
              }

              const nextReq = nextTier ? achievement.tiers[nextTier].requirement : null;
              const progress = nextReq ? Math.min(1, value / nextReq) : 1;

              return (
                <motion.div
                  key={achievement.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'rounded-xl border p-4 transition-all',
                    highestTier
                      ? 'bg-white dark:bg-card border-border/60 shadow-sm'
                      : 'bg-muted/20 border-border/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={cn(
                      'p-2.5 rounded-xl border shrink-0',
                      highestTier ? getTierBg(highestTier) : 'bg-muted/40 border-border/40'
                    )}>
                      {highestTier ? (
                        <Icon className={cn('h-5 w-5', getTierColor(highestTier))} />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground/50" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={cn(
                          'font-semibold text-sm',
                          highestTier ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                          {achievement.title}
                        </p>
                        {highestTier && (
                          <span className={cn('text-xs font-bold', getTierColor(highestTier))}>
                            {getTierLabel(highestTier)}
                          </span>
                        )}
                      </div>

                      {/* Tier badges */}
                      <div className="flex gap-1 mb-2">
                        {TIERS.map(tier => (
                          <div
                            key={tier}
                            className={cn(
                              'h-1.5 flex-1 rounded-full transition-all',
                              unlockedSet.has(`${achievement.key}:${tier}`)
                                ? tier === 'gold' ? 'bg-yellow-500' : tier === 'silver' ? 'bg-slate-400' : 'bg-amber-500'
                                : 'bg-muted/60'
                            )}
                          />
                        ))}
                      </div>

                      {/* Next target */}
                      {nextTier ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {achievement.tiers[nextTier].label}
                            </p>
                            <span className="text-xs font-medium text-muted-foreground">
                              {Math.round(progress * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted/40 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-lime-500/70 transition-all duration-500"
                              style={{ width: `${progress * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-lime-600 dark:text-lime-400 font-medium">
                          ✅ Completo!
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
