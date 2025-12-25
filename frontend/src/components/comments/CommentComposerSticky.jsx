import { useEffect, useRef, useState } from 'react';
import { createComment } from '../../services/api';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/Input';

export const CommentComposerSticky = ({ postId, onCommentAdded, autoFocus = true }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (autoFocus) {
      textAreaRef.current?.focus();
    }
  }, [autoFocus, postId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim()) {
      setError('Hãy viết bình luận trước khi gửi.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { data } = await createComment(postId, content.trim());
      setContent('');
      onCommentAdded?.(data);
    } catch (err) {
      const message = err?.response?.data?.message || 'Gửi bình luận thất bại, thử lại.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="thread-composer-shell sticky bottom-0 z-30">
      <div className="thread-composer-gradient pointer-events-none" aria-hidden="true" />
      <div className="relative border-t border-[var(--border)] bg-[var(--bg1)] px-5 py-4 backdrop-blur shadow-[0_-16px_30px_rgba(0,0,0,0.7)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex gap-3">
            <TextArea
              ref={textAreaRef}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Gửi bình luận…"
              rows={3}
              className="input--textarea flex-1 min-h-[72px]"
              disabled={isSubmitting}
              style={{ minHeight: '78px' }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="self-end whitespace-nowrap"
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? 'Đang gửi...' : 'Đăng'}
            </Button>
          </div>
          {error && (
            <div className="text-xs text-[var(--red)]" role="alert">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
