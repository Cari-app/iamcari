import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { PostCard } from '@/components/community/PostCard';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export interface FeedPost {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  created_at: string;
  profiles: {
    id: string;
    whatsapp_number: string | null;
    user_stats: {
      current_level: number;
    }[];
  };
  feed_likes: {
    user_id: string;
  }[];
  _count?: {
    likes: number;
  };
}

export default function Community() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('feed_posts')
        .select(`
          *,
          profiles!feed_posts_user_id_fkey (
            id,
            whatsapp_number,
            user_stats (
              current_level
            )
          ),
          feed_likes (
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match our interface
      const transformedPosts = (data || []).map(post => ({
        ...post,
        _count: {
          likes: post.feed_likes?.length || 0
        }
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Erro ao carregar posts',
        description: 'Não foi possível carregar os posts da comunidade.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Subscribe to new posts
    const channel = supabase
      .channel('feed_posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feed_posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const hasLiked = post.feed_likes.some(like => like.user_id === user.id);

    // Optimistic UI update
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId) {
          if (hasLiked) {
            return {
              ...p,
              feed_likes: p.feed_likes.filter(like => like.user_id !== user.id),
              _count: {
                likes: (p._count?.likes || 1) - 1
              }
            };
          } else {
            return {
              ...p,
              feed_likes: [...p.feed_likes, { user_id: user.id }],
              _count: {
                likes: (p._count?.likes || 0) + 1
              }
            };
          }
        }
        return p;
      })
    );

    try {
      if (hasLiked) {
        // Unlike
        const { error } = await supabase
          .from('feed_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('feed_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      fetchPosts();
      toast({
        title: 'Erro',
        description: 'Não foi possível curtir o post.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24 pt-20">
      <Navbar />
      
      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed top-[86px] right-4 z-40"
      >
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow p-0"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>
      
      <main className="px-4 py-6">

        {/* Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-muted/50" />
                  <div className="flex-1">
                    <div className="h-3 bg-muted/50 rounded w-24 mb-1.5" />
                    <div className="h-2 bg-muted/50 rounded w-16" />
                  </div>
                </div>
                <div className="aspect-square bg-muted/50 rounded-xl mb-3" />
                <div className="h-3 bg-muted/50 rounded w-full mb-2" />
                <div className="h-3 bg-muted/50 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 px-6"
          >
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-base font-medium mb-1.5 text-foreground/80">Nenhum post ainda</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Seja o primeiro a compartilhar sua jornada!
            </p>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              className="rounded-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Post
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PostCard
                  post={post}
                  currentUserId={user?.id}
                  onLike={handleLike}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
      
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onPostCreated={fetchPosts}
      />
    </div>
  );
}
