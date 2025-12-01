import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { FeedPost } from '@/pages/Community';
import { motion } from 'framer-motion';

interface PostCardProps {
  post: FeedPost;
  currentUserId?: string;
  onLike: (postId: string) => void;
}

export function PostCard({ post, currentUserId, onLike }: PostCardProps) {
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);
  
  const hasLiked = currentUserId 
    ? post.feed_likes.some(like => like.user_id === currentUserId)
    : false;
  
  const likeCount = post._count?.likes || 0;
  const userLevel = post.profiles?.user_stats?.[0]?.current_level || 1;
  
  // Get username from whatsapp_number or use fallback
  const username = post.profiles?.whatsapp_number 
    ? `@${post.profiles.whatsapp_number.slice(-4)}`
    : 'Usuário';

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ptBR
  }).replace('há cerca de ', '').replace('há ', '');

  const handleDoubleTap = () => {
    if (!hasLiked) {
      setLikeAnimation(true);
      onLike(post.id);
      setTimeout(() => setLikeAnimation(false), 1000);
    }
  };

  const truncateCaption = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <article className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`} />
            <AvatarFallback className="bg-muted text-foreground text-xs">
              {username[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-foreground">{username}</span>
            <Badge 
              variant="secondary" 
              className="text-[9px] px-1.5 py-0 h-4 bg-gradient-primary text-white border-0"
            >
              Nv{userLevel}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          <button className="p-2 hover:bg-accent rounded-full transition-colors -mr-2">
            <MoreHorizontal className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Image - Full Width */}
      <div 
        className="relative w-full aspect-[4/5] bg-muted/30 overflow-hidden"
        onDoubleClick={handleDoubleTap}
      >
        <img
          src={post.image_url}
          alt="Post"
          className="w-full h-full object-cover"
        />
        
        {/* Double Tap Like Animation */}
        {likeAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.2, 1], opacity: [1, 1, 0] }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Heart className="h-24 w-24 fill-white text-white drop-shadow-2xl" />
          </motion.div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLike(post.id)}
            className="press-effect -ml-2 p-2"
          >
            <Heart
              className={cn(
                'h-7 w-7 transition-all',
                hasLiked ? 'fill-rose text-rose scale-110' : 'text-foreground'
              )}
            />
          </button>
          <button className="p-2 press-effect">
            <MessageCircle className="h-7 w-7 text-foreground" />
          </button>
        </div>
        <button className="p-2 press-effect">
          <Share2 className="h-6 w-6 text-foreground" />
        </button>
      </div>

      {/* Likes Count */}
      {likeCount > 0 && (
        <div className="px-4 pb-2">
          <span className="text-sm font-semibold text-foreground">
            {likeCount === 1 ? '1 curtida' : `${likeCount} curtidas`}
          </span>
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed">
            <span className="font-semibold text-foreground mr-1.5">{username}</span>
            <span className="text-foreground/90">
              {showFullCaption ? post.caption : truncateCaption(post.caption)}
            </span>
            {post.caption.length > 100 && (
              <button
                onClick={() => setShowFullCaption(!showFullCaption)}
                className="text-muted-foreground ml-1 hover:text-foreground transition-colors"
              >
                {showFullCaption ? 'menos' : 'mais'}
              </button>
            )}
          </p>
        </div>
      )}
    </article>
  );
}
