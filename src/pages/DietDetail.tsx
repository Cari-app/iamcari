import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Diet {
  id: string;
  name: string;
  icon: string;
  short_description: string;
  full_description: string;
  color_theme: string;
}

interface Section {
  id: string;
  emoji: string;
  title: string;
  content: string;
}

export default function DietDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dietId = searchParams.get('diet');
  
  const [diet, setDiet] = useState<Diet | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiet();
  }, [dietId]);

  const fetchDiet = async () => {
    if (!dietId) {
      navigate('/diets');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('diet_types')
        .select('*')
        .eq('id', dietId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setDiet(data);
        parseSections(data.full_description || '');
      }
    } catch (error) {
      console.error('Error fetching diet:', error);
      navigate('/diets');
    } finally {
      setLoading(false);
    }
  };

  const parseSections = (markdown: string) => {
    const lines = markdown.split('\n');
    const parsed: Section[] = [];
    let currentSection: Section | null = null;
    let contentBuffer: string[] = [];

    lines.forEach((line) => {
      // Detect section headers: ## emoji number. Title
      // Matches: ## 📌 1. Cabeçalho
      const headerMatch = line.match(/^##\s+(\S+)\s+(\d+)\.\s+(.+)$/);
      
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          currentSection.content = contentBuffer.join('\n').trim();
          parsed.push(currentSection);
        }
        
        // Start new section
        const emoji = headerMatch[1];
        const title = headerMatch[3];
        currentSection = {
          id: `section-${parsed.length}`,
          emoji,
          title,
          content: '',
        };
        contentBuffer = [];
      } else if (currentSection) {
        contentBuffer.push(line);
      }
    });

    // Save last section
    if (currentSection) {
      currentSection.content = contentBuffer.join('\n').trim();
      parsed.push(currentSection);
    }

    setSections(parsed);
  };

  const getColorClasses = (theme: string) => {
    const colorMap: Record<string, string> = {
      violet: 'text-violet-400',
      teal: 'text-teal-400',
      red: 'text-red-400',
      orange: 'text-orange-400',
      blue: 'text-blue-400',
      green: 'text-green-400',
      emerald: 'text-emerald-400',
    };
    return colorMap[theme] || 'text-violet-400';
  };

  const getBgClasses = (theme: string) => {
    const colorMap: Record<string, string> = {
      violet: 'from-violet-500/10 to-violet-500/5 border-violet-500/30',
      teal: 'from-teal-500/10 to-teal-500/5 border-teal-500/30',
      red: 'from-red-500/10 to-red-500/5 border-red-500/30',
      orange: 'from-orange-500/10 to-orange-500/5 border-orange-500/30',
      blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/30',
      green: 'from-green-500/10 to-green-500/5 border-green-500/30',
      emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/30',
    };
    return colorMap[theme] || 'from-violet-500/10 to-violet-500/5 border-violet-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-24 px-4 max-w-lg mx-auto space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!diet) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-24 px-4 max-w-lg mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {/* Diet Header */}
          <div
            className={cn(
              'p-6 rounded-2xl border-2 bg-gradient-to-br mb-6',
              getBgClasses(diet.color_theme)
            )}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="text-5xl">{diet.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className={cn('h-4 w-4', getColorClasses(diet.color_theme))} />
                  <p className="text-xs font-medium text-muted-foreground">
                    Sua Dieta
                  </p>
                </div>
                <h1 className={cn('text-2xl font-bold', getColorClasses(diet.color_theme))}>
                  {diet.name}
                </h1>
              </div>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {diet.short_description}
            </p>
          </div>

          {/* Subtitle */}
          <p className="text-center text-sm text-muted-foreground mb-6">
            Um guia completo para você entender e seguir no dia a dia
          </p>
        </motion.div>

        {/* Content Sections */}
        {sections.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {sections.map((section, index) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border border-border rounded-2xl overflow-hidden bg-card/30 backdrop-blur-sm"
                >
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-accent/50 transition-colors [&[data-state=open]]:bg-accent/30">
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-2xl shrink-0">{section.emoji}</span>
                      <span className="font-semibold text-foreground text-sm leading-tight">
                        {section.title}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4 pt-2">
                    <div className="prose prose-sm prose-invert max-w-none">
                      <div
                        className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm"
                        dangerouslySetInnerHTML={{
                          __html: section.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                            .replace(/✔️/g, '<span class="text-teal-400">✔️</span>')
                            .replace(/^- (.+)$/gm, '<div class="flex gap-2 mb-2"><span class="text-teal-400 shrink-0">•</span><span>$1</span></div>')
                            .replace(/^(\d+)\. (.+)$/gm, '<div class="flex gap-2 mb-2"><span class="text-violet-400 font-semibold shrink-0">$1.</span><span>$2</span></div>')
                        }}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        ) : (
          // Fallback se não houver seções
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card/30 backdrop-blur-sm p-6"
          >
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {diet.full_description}
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 space-y-3"
        >
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Começar Agora
          </Button>
          <Button
            onClick={() => navigate('/diets')}
            variant="outline"
            className="w-full h-12 text-base"
            size="lg"
          >
            Explorar Outras Dietas
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
