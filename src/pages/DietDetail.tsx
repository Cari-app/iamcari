import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logoImage from '@/assets/logo-cari.png';

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
  const { profile } = useAuth();
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
      const headerMatch = line.match(/^##\s+(\S+)\s+(\d+)\.\s+(.+)$/);
      
      if (headerMatch) {
        if (currentSection) {
          currentSection.content = contentBuffer.join('\n').trim();
          parsed.push(currentSection);
        }
        
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

    if (currentSection) {
      currentSection.content = contentBuffer.join('\n').trim();
      parsed.push(currentSection);
    }

    setSections(parsed);
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] pb-32 bg-background">
        <div className="mx-auto max-w-lg relative">
          <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-green-950 via-green-900 to-transparent" />
          <div className="relative z-10 pt-20 px-4 space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!diet) return null;

  return (
    <div className="min-h-[100dvh] pb-32 bg-background">
      <div className="mx-auto max-w-lg relative">
        {/* Green Gradient Background */}
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-green-950 via-green-900 to-transparent" />
        
        <div className="relative z-10">
          {/* Top Bar */}
          <header className="flex items-center justify-between px-4 pb-2 pt-safe-top">
            <img src={logoImage} alt="Cari" className="h-6" />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link to="/profile">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-white/20 text-white">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>

          <main className="px-4 pt-6 space-y-4">
            {/* Diet Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border border-border bg-card"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="text-5xl">{diet.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-[#84cc16]" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Sua Dieta
                    </p>
                  </div>
                  <h1 className="text-2xl font-bold text-[#84cc16]">
                    {diet.name}
                  </h1>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {diet.short_description}
              </p>
            </motion.div>

            <p className="text-center text-sm text-muted-foreground">
              Um guia completo para você entender e seguir no dia a dia
            </p>

            {/* Content Sections */}
            {sections.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Accordion type="single" collapsible className="space-y-3">
                  {sections.map((section) => (
                    <AccordionItem
                      key={section.id}
                      value={section.id}
                      className="border border-border rounded-2xl overflow-hidden bg-card"
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
                            className="text-muted-foreground leading-relaxed text-sm"
                            dangerouslySetInnerHTML={{
                              __html: section.content
                                .replace(/\*([^\*\n]+)\*/g, '$1')
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                                .replace(/\\n/g, '\n')
                                .replace(/^---+$/gm, '')
                                .replace(/^>\s*/gm, '')
                                .replace(/^\* (.+)$/gm, '<div class="flex gap-2 mb-2"><span class="text-[#84cc16] shrink-0">•</span><span>$1</span></div>')
                                .replace(/^- (.+)$/gm, '<div class="flex gap-2 mb-2"><span class="text-[#84cc16] shrink-0">•</span><span>$1</span></div>')
                                .replace(/^(\d+)\. (.+)$/gm, '<div class="flex gap-2 mb-2"><span class="text-[#84cc16] font-semibold shrink-0">$1.</span><span>$2</span></div>')
                                .replace(/✔️/g, '<span class="text-[#84cc16]">✔️</span>')
                                .split('\n')
                                .map(line => line.trim())
                                .filter(line => line.length > 0)
                                .join('<br/><br/>')
                            }}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-border bg-card p-6"
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
              className="space-y-3 pb-8"
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
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
