import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight, Reply, Heart, Clock, History, TrendingUp } from "lucide-react";
import { EventComment } from "@/lib/eventTypes";
import { getComments, addComment, likeComment, hasLikedComment } from "@/lib/supabaseStore";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import RichEditor from "./RichEditor";
import { useToast } from "@/hooks/use-toast";
import { containsProfanity } from "@/utils/profanityFilter";
import { getRandomName } from "@/utils/randomNames";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommentSectionProps {
  postId: string;
  sortOrder?: 'latest' | 'oldest' | 'popular';
}

interface CommentWithReplies extends Omit<EventComment, 'author'> {
  author?: string;
  replies: CommentWithReplies[];
  collapsed: boolean;
  name?: string;
  updatedAt?: number;
  likesCount?: number; // 좋아요 수 추가
  isLiked?: boolean; // 현재 사용자가 좋아요 했는지 여부
}

const CommentSection = ({ postId, sortOrder: propSortOrder = 'latest' }: CommentSectionProps) => {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest" | "popular">(propSortOrder);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newCommentAuthor, setNewCommentAuthor] = useState("");
  const [newCommentMessage, setNewCommentMessage] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    // localStorage에서 좋아요 상태 불러오기
    const storedLikes = localStorage.getItem('likedComments');
    if (storedLikes) {
      setLikedComments(new Set(JSON.parse(storedLikes)));
    }
  }, [postId]);
  
  useEffect(() => {
    // props로 받은 sortOrder 변경 시 적용
    setSortOrder(propSortOrder);
  }, [propSortOrder]);

  useEffect(() => {
    // sortOrder 변경 시 댓글 재정렬
    if (comments.length > 0) {
      const flatComments = comments.flatMap(flattenComment);
      const reorganized = organizeComments(flatComments);
      setComments(reorganized);
    }
  }, [sortOrder]);
  
  const flattenComment = (comment: CommentWithReplies): EventComment[] => {
    const comments: EventComment[] = [{
      id: comment.id,
      postId: comment.postId,
      parentId: comment.parentId,
      author: comment.author || comment.name || '익명',
      message: comment.message,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      likesCount: comment.likesCount || 0
    }];
    
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.forEach(reply => {
        comments.push(...flattenComment(reply));
      });
    }
    
    return comments;
  };

  const fetchComments = async () => {
    try {
      const commentsData = await getComments(postId);
      const organizedComments = organizeComments(commentsData);
      setComments(organizedComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast({
        title: "오류",
        description: "댓글을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const sortComments = (comments: CommentWithReplies[]): CommentWithReplies[] => {
    return [...comments].sort((a, b) => {
      switch (sortOrder) {
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'popular':
          // 좋아요 수로 정렬, 같으면 최신순
          const likeDiff = (b.likesCount || 0) - (a.likesCount || 0);
          if (likeDiff !== 0) return likeDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  };

  const organizeComments = (commentsData: EventComment[]): CommentWithReplies[] => {
    const commentMap = new Map<string, CommentWithReplies>();
    const rootComments: CommentWithReplies[] = [];

    // 모든 댓글 객체 생성
    commentsData.forEach(comment => {
      commentMap.set(comment.id, {
        ...comment,
        author: comment.author || (comment as any).name || '익명',
        replies: [],
        collapsed: false,
        likesCount: comment.likesCount || 0,
        isLiked: likedComments.has(comment.id)
      });
    });

    // 계층 구조 구성
    commentsData.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    // 루트 댓글 정렬
    const sortedRootComments = sortComments(rootComments);
    
    // 답글도 같은 정렬 기준 적용
    const sortReplies = (comments: CommentWithReplies[]): CommentWithReplies[] => {
      return comments.map(comment => ({
        ...comment,
        replies: comment.replies ? sortComments(sortReplies(comment.replies)) : []
      }));
    };

    return sortReplies(sortedRootComments);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentMessage.trim()) {
      toast({
        title: "오류",
        description: "댓글을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (containsProfanity(newCommentMessage) || (newCommentAuthor && containsProfanity(newCommentAuthor))) {
      toast({
        title: "오류",
        description: "부적절한 언어가 포함되어 있습니다. 내용을 수정해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const finalAuthor = newCommentAuthor.trim() || getRandomName();
      await addComment(postId, {
        author: finalAuthor,
        message: newCommentMessage,
      });
      
      setNewCommentAuthor("");
      setNewCommentMessage("");
      await fetchComments();
      
      toast({
        title: "성공",
        description: "댓글이 등록되었습니다!",
      });
    } catch (error) {
      console.error("Comment submit error:", error);
      toast({
        title: "오류",
        description: "댓글 등록에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyMessage.trim()) {
      toast({
        title: "오류",
        description: "답글을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (containsProfanity(replyMessage) || (replyAuthor && containsProfanity(replyAuthor))) {
      toast({
        title: "오류",
        description: "부적절한 언어가 포함되어 있습니다. 내용을 수정해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const finalAuthor = replyAuthor.trim() || getRandomName();
      await addComment(postId, {
        author: finalAuthor,
        message: replyMessage,
        parentId,
      });
      
      setReplyAuthor("");
      setReplyMessage("");
      setReplyingTo(null);
      await fetchComments();
      
      toast({
        title: "성공",
        description: "답글이 등록되었습니다!",
      });
    } catch (error) {
      console.error("Reply submit error:", error);
      toast({
        title: "오류",
        description: "답글 등록에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCollapse = (commentId: string) => {
    const updateCollapse = (comments: CommentWithReplies[]): CommentWithReplies[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, collapsed: !comment.collapsed };
        }
        return {
          ...comment,
          replies: updateCollapse(comment.replies)
        };
      });
    };
    setComments(updateCollapse(comments));
  };

  const handleLikeComment = async (commentId: string) => {
    // 이미 좋아요한 경우 차단
    if (likedComments.has(commentId)) {
      toast({
        title: "알림",
        description: "이미 좋아요를 누른 댓글입니다.",
      });
      return;
    }

    try {
      const newCount = await likeComment(commentId);
      
      // 좋아요 상태 업데이트
      const newLikedComments = new Set(likedComments);
      newLikedComments.add(commentId);
      setLikedComments(newLikedComments);
      
      // localStorage에 저장
      localStorage.setItem('likedComments', JSON.stringify(Array.from(newLikedComments)));
      
      // 댓글 상태 업데이트
      const updateLikes = (comments: CommentWithReplies[]): CommentWithReplies[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return { 
              ...comment, 
              likesCount: newCount,
              isLiked: true 
            };
          }
          return {
            ...comment,
            replies: updateLikes(comment.replies)
          };
        });
      };
      
      setComments(updateLikes(comments));
      
      toast({
        title: "성공",
        description: "좋아요를 눌렀습니다!",
      });
    } catch (error) {
      console.error("Like comment error:", error);
      toast({
        title: "오류",
        description: "좋아요 추가에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const getSortIcon = () => {
    switch (sortOrder) {
      case 'latest':
        return <Clock className="h-4 w-4" />;
      case 'oldest':
        return <History className="h-4 w-4" />;
      case 'popular':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getSortLabel = () => {
    switch (sortOrder) {
      case 'latest':
        return '최신순';
      case 'oldest':
        return '과거순';
      case 'popular':
        return '인기순';
      default:
        return '최신순';
    }
  };

  const renderComment = (comment: CommentWithReplies, depth: number = 0) => {
    const hasReplies = comment.replies.length > 0;
    const marginLeft = depth * 24;
    const isLiked = likedComments.has(comment.id);
    
    // 대댓글 깊이를 3단계로 제한 (0, 1, 2)
    const MAX_DEPTH = 2;
    const canReply = depth < MAX_DEPTH;

    return (
      <div key={comment.id} style={{ marginLeft: `${marginLeft}px` }} className="border-l-2 border-gray-100 pl-3">
        <div className="bg-card p-3 rounded-lg shadow-sm mb-2">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-medium text-sm">
                {comment.author}
                {depth > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {depth === 1 ? '답글' : '대답글'}
                  </span>
                )}
              </h4>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}
              </p>
            </div>
            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCollapse(comment.id)}
                className="flex items-center gap-1 text-xs h-6"
              >
                {comment.collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {comment.replies.length}개 답글
              </Button>
            )}
          </div>
          
          <div 
            className="prose prose-sm max-w-none mb-2 text-sm"
            dangerouslySetInnerHTML={{ __html: comment.message }}
          />
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikeComment(comment.id)}
              disabled={isLiked}
              className={`flex items-center gap-1 h-6 text-xs ${
                isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart className={`h-3 w-3 ${isLiked ? "fill-current" : ""}`} />
              {comment.likesCount || 0}
            </Button>
            
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 h-6 text-xs"
              >
                <Reply className="h-3 w-3" />
                답글
              </Button>
            )}
            
            {!canReply && depth === MAX_DEPTH && (
              <span className="text-xs text-muted-foreground italic">최대 깊이</span>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-4 space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor={`reply-author-${comment.id}`}>이름 (선택사항)</Label>
                <Input
                  id={`reply-author-${comment.id}`}
                  value={replyAuthor}
                  onChange={(e) => setReplyAuthor(e.target.value)}
                  placeholder="이름을 입력하세요 (미입력시 랜덤 이름으로 표시)"
                />
              </div>
              
              <div className="space-y-2">
                <Label>답글</Label>
                <RichEditor
                  value={replyMessage}
                  onChange={setReplyMessage}
                  placeholder="답글을 작성하세요..."
                  maxLength={10000}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyAuthor("");
                    setReplyMessage("");
                  }}
                  size="sm"
                >
                  취소
                </Button>
                <Button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={isSubmitting || !replyMessage.trim()}
                  size="sm"
                >
                  {isSubmitting ? "등록 중..." : "답글 등록"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {hasReplies && !comment.collapsed && (
          <div className="ml-2">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // 전체 댓글 수 계산 (답글 포함)
  const getTotalCommentCount = (comments: CommentWithReplies[]): number => {
    return comments.reduce((total, comment) => {
      return total + 1 + getTotalCommentCount(comment.replies);
    }, 0);
  };

  const totalCommentCount = getTotalCommentCount(comments);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          댓글 <span className="text-primary">{totalCommentCount}</span>개
        </h3>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              {getSortIcon()}
              <span>{getSortLabel()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => setSortOrder('latest')}
              className={sortOrder === 'latest' ? 'bg-accent' : ''}
            >
              <Clock className="mr-2 h-4 w-4" />
              최신순
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortOrder('oldest')}
              className={sortOrder === 'oldest' ? 'bg-accent' : ''}
            >
              <History className="mr-2 h-4 w-4" />
              과거순
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortOrder('popular')}
              className={sortOrder === 'popular' ? 'bg-accent' : ''}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              인기순
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 댓글 작성 폼 */}
      <div className="bg-card p-4 rounded-lg border">
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment-author">이름 (선택사항)</Label>
            <Input
              id="comment-author"
              value={newCommentAuthor}
              onChange={(e) => setNewCommentAuthor(e.target.value)}
              placeholder="이름을 입력하세요 (미입력시 랜덤 이름으로 표시)"
              maxLength={50}
            />
          </div>
          
          <div className="space-y-2">
            <Label>댓글</Label>
            <RichEditor
              value={newCommentMessage}
              onChange={setNewCommentMessage}
              placeholder="댓글을 작성하세요..."
              maxLength={10000}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || !newCommentMessage.trim()}
            >
              {isSubmitting ? "등록 중..." : "댓글 등록"}
            </Button>
          </div>
        </form>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-0">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
          </p>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
