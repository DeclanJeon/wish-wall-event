import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight, Reply, Heart } from "lucide-react";
import { EventComment } from "@/lib/eventTypes";
import { getComments, addComment, likeComment, hasLikedComment } from "@/lib/supabaseStore";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import RichEditor from "./RichEditor";
import { useToast } from "@/hooks/use-toast";
import { containsProfanity } from "@/utils/profanityFilter";
import { getRandomName } from "@/utils/randomNames";

interface CommentSectionProps {
  postId: string;
}

interface CommentWithReplies extends EventComment {
  replies: CommentWithReplies[];
  collapsed: boolean;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest" | "popular">("latest");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newCommentAuthor, setNewCommentAuthor] = useState("");
  const [newCommentMessage, setNewCommentMessage] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [postId, sortOrder]);

  const fetchComments = async () => {
    const commentsData = await getComments(postId);
    const organizedComments = organizeComments(commentsData);
    setComments(organizedComments);
  };

  const organizeComments = (commentsData: EventComment[]): CommentWithReplies[] => {
    const commentMap = new Map<string, CommentWithReplies>();
    const rootComments: CommentWithReplies[] = [];

    // First, create all comment objects
    commentsData.forEach(comment => {
      commentMap.set(comment.id, {
        ...comment,
        replies: [],
        collapsed: false
      });
    });

    // Then, organize them into hierarchies
    commentsData.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    // Sort comments and replies using the same sort order
    const sortComments = (comments: CommentWithReplies[]) => {
      comments.sort((a, b) => {
        if (sortOrder === "latest") {
          return b.createdAt - a.createdAt;
        } else if (sortOrder === "oldest") {
          return a.createdAt - b.createdAt;
        } else { // popular
          return (b.likesCount || 0) - (a.likesCount || 0);
        }
      });
      comments.forEach(comment => {
        if (comment.replies.length > 0) {
          sortComments(comment.replies);
        }
      });
    };

    sortComments(rootComments);
    return rootComments;
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

    // 비속어 검사
    if (containsProfanity(newCommentMessage)) {
      toast({
        title: "오류",
        description: "부적절한 언어가 포함되어 있습니다. 내용을 수정해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const finalAuthor = newCommentAuthor || getRandomName();
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

    // 비속어 검사
    if (containsProfanity(replyMessage)) {
      toast({
        title: "오류",
        description: "부적절한 언어가 포함되어 있습니다. 내용을 수정해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const finalAuthor = replyAuthor || getRandomName();
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
    try {
      const newCount = await likeComment(commentId);
      // 댓글 목록을 다시 가져와서 업데이트
      await fetchComments();
    } catch (error) {
      toast({
        title: "오류",
        description: "좋아요 추가에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const renderComment = (comment: CommentWithReplies, depth: number = 0) => {
    const hasReplies = comment.replies.length > 0;
    const marginLeft = depth * 24;
    
    // 대댓글 계층을 4개로 제한
    if (depth >= 4) return null;

    return (
      <div key={comment.id} style={{ marginLeft: `${marginLeft}px` }} className="border-l-2 border-gray-100 pl-3">
        <div className="bg-card p-3 rounded-lg shadow-sm mb-2">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-medium text-sm">{comment.author}</h4>
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
              disabled={hasLikedComment(comment.id)}
              className={`flex items-center gap-1 h-6 text-xs ${hasLikedComment(comment.id) ? "text-red-500" : "text-muted-foreground"}`}
            >
              <Heart className={`h-3 w-3 ${hasLikedComment(comment.id) ? "fill-current" : ""}`} />
              {comment.likesCount || 0}
            </Button>
            
            {depth < 3 && (
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
                  onClick={() => setReplyingTo(null)}
                  size="sm"
                >
                  취소
                </Button>
                <Button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={isSubmitting}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">댓글 {comments.length}개</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">정렬:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "latest" ? "oldest" : sortOrder === "oldest" ? "popular" : "latest")}
          >
            {sortOrder === "latest" ? "최신순" : sortOrder === "oldest" ? "과거순" : "인기순"}
          </Button>
        </div>
      </div>

      {/* New Comment Form */}
      <div className="bg-card p-4 rounded-lg border">
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment-author">이름 (선택사항)</Label>
            <Input
              id="comment-author"
              value={newCommentAuthor}
              onChange={(e) => setNewCommentAuthor(e.target.value)}
              placeholder="이름을 입력하세요 (미입력시 랜덤 이름으로 표시)"
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "등록 중..." : "댓글 등록"}
            </Button>
          </div>
        </form>
      </div>

      {/* Comments List */}
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