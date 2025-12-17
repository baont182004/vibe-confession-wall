import { useState } from 'react';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/Input';
import { createComment } from '../../services/api';

export const CommentInput = ({ postId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const { data } = await createComment(postId, content);
      setContent('');
      if (onCommentAdded) onCommentAdded(data);
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        rows={2}
        disabled={isSubmitting}
        className="input--textarea"
        style={{ minHeight: '80px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          size="sm"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </form>
  );
};
