import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Gift } from "lucide-react";

interface ConceptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToEvent: () => void;
}

const ConceptModal = ({ open, onOpenChange, onNavigateToEvent }: ConceptModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            마음을 전하는 위시월
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">소중한 사람에게</p>
            <p className="text-lg font-medium">따뜻한 마음을 전해보세요</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-blue-900">응원 메시지 작성</h3>
                <p className="text-sm text-blue-700">마음이 담긴 메시지를 예쁜 카드로 꾸며보세요</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
              <Heart className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold text-purple-900">서로 응원하기</h3>
                <p className="text-sm text-purple-700">다른 분들의 메시지에 좋아요와 댓글을 남겨보세요</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <Gift className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-900">특별한 선물</h3>
                <p className="text-sm text-green-700">참여하신 분들께 준비된 선물도 받아보세요</p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              여러분의 따뜻한 마음이 모여<br />
              하나의 아름다운 위시월이 됩니다
            </p>

            <Button 
              onClick={onNavigateToEvent}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              size="lg"
            >
              지금 바로 시작하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConceptModal;