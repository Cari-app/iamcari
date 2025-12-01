import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { FeedPost } from '@/pages/Community';

interface PostCardProps {
  post: FeedPost;
  currentUserId?: string;
  onLike: (postId: string) => void;
}

export function PostCard({ post, currentUserId, onLike }: PostCardProps) {
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
  });

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-10 w-10 border border-border/50">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`} />
            <AvatarFallback className="bg-muted text-foreground text-sm">
              {username[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sm text-foreground">{username}</span>
              <Badge 
                variant="secondary" 
                className="text-[10px] px-1.5 py-0 h-4 bg-gradient-primary text-white border-0"
              >
                Nv. {userLevel}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-muted/30">
        <img
          src={post.image_url}
          alt="Post"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions & Caption */}
      <div className="p-3 space-y-2">
        {/* Like Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onLike(post.id)}
            className="press-effect transition-transform -ml-1"
          >
            <Heart
              className={cn(
                'h-6 w-6 transition-colors',
                hasLiked ? 'fill-rose text-rose' : 'text-foreground'
              )}
            />
          </button>
          <span className="text-xs font-medium text-foreground">
            {likeCount} {likeCount === 1 ? 'curtida' : 'curtidas'}
          </span>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="text-sm leading-relaxed">
            <span className="font-medium text-foreground mr-1.5">{username}</span>
            <span className="text-foreground/90">{post.caption}</span>
          </div>
        )}
      </div>
    </div>
  );
}
