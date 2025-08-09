import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import RichEditor from './RichEditor';
import { CardStyle } from './MessageCard';

const messageSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요").max(50, "이름은 50자 이내로 입력해주세요"),
  contactType: z.enum(["email", "phone"], { required_error: "연락 방법을 선택해주세요" }),
  email: z.string().email("올바른 이메일 형식을 입력해주세요").optional(),
  phone: z.string().min(10, "올바른 전화번호를 입력해주세요").optional(),
  message: z.string().min(1, "메시지를 입력해주세요"),
  cardStyle: z.enum(["letter", "memo", "postcard", "sticky", "modern"]),
  cardColor: z.string().optional()
}).refine((data) => {
  if (data.contactType === "email" && !data.email) {
    return false;
  }
  if (data.contactType === "phone" && !data.phone) {
    return false;
  }
  return true;
}, {
  message: "선택한 연락 방법에 맞는 정보를 입력해주세요",
  path: ["contactType"]
});

type MessageFormData = z.infer<typeof messageSchema>;

interface MessageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<MessageFormData, 'contactType'>) => Promise<void>;
}

const cardStyleOptions = [
  { value: 'letter', label: '편지형', description: '따뜻한 편지 느낌' },
  { value: 'memo', label: '메모지', description: '간단한 메모 스타일' },
  { value: 'postcard', label: '포스트카드', description: '예쁜 엽서 스타일' },
  { value: 'sticky', label: '스티키노트', description: '친근한 포스트잇' },
  { value: 'modern', label: '모던', description: '깔끔한 현대식' }
];

const colorOptions = [
  { value: '#fef3c7', label: '따뜻한 노랑' },
  { value: '#dbeafe', label: '차분한 파랑' },
  { value: '#fce7f3', label: '부드러운 분홍' },
  { value: '#d1fae5', label: '싱그러운 초록' },
  { value: '#f3e8ff', label: '우아한 보라' },
  { value: '#fff7ed', label: '따뜻한 주황' }
];

const MessageForm: React.FC<MessageFormProps> = ({ open, onOpenChange, onSubmit }) => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      name: '',
      contactType: 'email',
      email: '',
      phone: '',
      message: '',
      cardStyle: 'modern',
      cardColor: '#f3f4f6'
    }
  });

  const contactType = form.watch('contactType');
  const cardStyle = form.watch('cardStyle');

  const handleSubmit = async (data: MessageFormData) => {
    if (!message.trim()) {
      toast({
        title: "오류",
        description: "메시지를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        name: data.name,
        email: data.contactType === 'email' ? data.email : undefined,
        phone: data.contactType === 'phone' ? data.phone : undefined,
        message,
        cardStyle: data.cardStyle,
        cardColor: data.cardColor
      };

      await onSubmit(submitData);
      
      // Reset form
      form.reset();
      setMessage('');
      onOpenChange(false);
      
      toast({
        title: "성공",
        description: "메시지가 등록되었습니다!",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "메시지 등록에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>응원 메시지 남기기</DialogTitle>
          <DialogDescription>
            소중한 사람에게 따뜻한 메시지를 전해보세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="이름을 입력하세요"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label>연락 방법 *</Label>
              <RadioGroup
                value={contactType}
                onValueChange={(value: 'email' | 'phone') => 
                  form.setValue('contactType', value)
                }
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email">이메일</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone" />
                  <Label htmlFor="phone">전화번호</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactType === 'email' && (
              <div>
                <Label htmlFor="email-input">이메일 *</Label>
                <Input
                  id="email-input"
                  type="email"
                  {...form.register('email')}
                  placeholder="이메일을 입력하세요"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            )}

            {contactType === 'phone' && (
              <div>
                <Label htmlFor="phone-input">전화번호 *</Label>
                <Input
                  id="phone-input"
                  {...form.register('phone')}
                  placeholder="010-1234-5678"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <Label>카드 스타일</Label>
            <Select
              value={cardStyle}
              onValueChange={(value: CardStyle) => form.setValue('cardStyle', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cardStyleOptions.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <div>
                      <div className="font-medium">{style.label}</div>
                      <div className="text-sm text-muted-foreground">{style.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>카드 색상</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-8 h-8 rounded border-2 ${
                    form.watch('cardColor') === color.value 
                      ? 'border-primary scale-110' 
                      : 'border-border'
                  } transition-all`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => form.setValue('cardColor', color.value)}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>메시지 *</Label>
            <RichEditor
              value={message}
              onChange={setMessage}
              placeholder="따뜻한 응원 메시지를 남겨주세요..."
              maxLength={10000}
              className="mt-2"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '등록 중...' : '메시지 등록'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageForm;