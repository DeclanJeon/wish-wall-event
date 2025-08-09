import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Gift, Users } from 'lucide-react';

interface ConceptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoToEvent: () => void;
}

const ConceptModal: React.FC<ConceptModalProps> = ({ open, onOpenChange, onGoToEvent }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold mb-2">
            💝 위시월 이벤트
          </DialogTitle>
          <DialogDescription className="text-base">
            소중한 사람들과 마음을 나누는 특별한 공간
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200">
              <Heart className="w-8 h-8 mx-auto mb-2 text-pink-500" />
              <h3 className="font-semibold text-sm">마음 전하기</h3>
              <p className="text-xs text-muted-foreground mt-1">
                따뜻한 응원과 사랑의 메시지
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold text-sm">소통하기</h3>
              <p className="text-xs text-muted-foreground mt-1">
                댓글과 대댓글로 함께 나누기
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold text-sm">함께하기</h3>
              <p className="text-xs text-muted-foreground mt-1">
                모든 메시지가 하나의 벽을 만들어가요
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
              <Gift className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <h3 className="font-semibold text-sm">선물받기</h3>
              <p className="text-xs text-muted-foreground mt-1">
                참여하시면 특별한 선물도!
              </p>
            </div>
          </div>

          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-2">✨ 어떻게 참여하나요?</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>1️⃣ 이름과 연락처를 입력하세요</p>
              <p>2️⃣ 예쁜 카드 스타일을 골라보세요</p>
              <p>3️⃣ 마음이 담긴 메시지를 작성하세요</p>
              <p>4️⃣ 다른 분들의 메시지도 구경해보세요</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              둘러보기
            </Button>
            <Button
              onClick={onGoToEvent}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              메시지 남기러 가기 ✨
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConceptModal;