import { useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { createPost } from '../services/api';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { TextArea } from './ui/Input';
import { cn } from '../lib/utils';

const MAX_POST_WORDS = 200;
const countWords = (value = '') =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

export const PostComposer = ({ user, onPostCreated, className }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const wordCount = useMemo(() => countWords(content), [content]);
  const overLimit = wordCount > MAX_POST_WORDS;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim()) {
      setError('Hãy viết điều gì đó trước khi đăng.');
      return;
    }
    if (overLimit) {
      setError(`Bài viết tối đa ${MAX_POST_WORDS} từ.`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createPost(content.trim());
      setContent('');
      onPostCreated?.();
    } catch (err) {
      const message = err?.response?.data?.message || 'Đăng bài thất bại, thử lại.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn('overflow-hidden border border-[var(--border)]', className)}>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex gap-4 px-5 pt-5">
          <Avatar user={user} size={48} />
          <TextArea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Bạn đang nghĩ gì?"
            maxLength={4000}
            className="input--textarea"
            style={{ minHeight: '90px' }}
            disabled={isSubmitting}
          />
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-[var(--divider)] bg-[rgba(254,197,230,0.35)] px-5 py-4 text-xs text-[var(--textMuted)]">
          <div>
            <span>Chia sẻ suy nghĩ, tạo năng lượng tích cực.</span>
            <div className="text-[0.7rem] text-[var(--textMuted)]">
              {wordCount}/{MAX_POST_WORDS} từ
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={!content.trim() || isSubmitting || overLimit}
          >
            <Send size={16} />
            {isSubmitting ? 'Đang đăng...' : 'Đăng'}
          </Button>
        </div>
        {error && (
          <div className="notice is-error mt-3 px-5" role="alert">
            {error}
          </div>
        )}
      </form>
    </Card>
  );
};
