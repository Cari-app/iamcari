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
  const userLevel = post.user_stats[0]?.level || 1;
  
  // Get username from whatsapp_number or use fallback
  const username = post.profiles?.whatsapp_number 
    ? `@${post.profiles.whatsapp_number.slice(-4)}`
    : 'Usuário';

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <div className="glass rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {username[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{username}</span>
              <Badge 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-gradient-primary text-white border-0"
              >
                Nível {userLevel}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-muted">
        <img
          src={post.image_url}
          alt="Post"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions & Caption */}
      <div className="p-4 space-y-3">
        {/* Like Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onLike(post.id)}
            className="press-effect transition-transform"
          >
            <Heart
              className={cn(
                'h-7 w-7 transition-colors',
                hasLiked ? 'fill-rose text-rose' : 'text-foreground'
              )}
            />
          </button>
          <span className="text-sm font-semibold text-foreground">
            {likeCount} {likeCount === 1 ? 'curtida' : 'curtidas'}
          </span>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="text-sm">
            <span className="font-semibold text-foreground mr-2">{username}</span>
            <span className="text-foreground">{post.caption}</span>
          </div>
        )}
      </div>
    </div>
  );
}
