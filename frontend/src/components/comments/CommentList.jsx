import { useState, useEffect } from 'react';
import { getComments } from '../../services/api';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { Button } from '../ui/Button';

export const CommentList = ({ postId, user }) => {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchComments = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await getComments(postId, p);
      if (p === 1) {
        setComments(data.comments);
      } else {
        setComments(prev => [...prev, ...data.comments]);
      }
      setHasMore(p < data.pages);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [postId]);

  const handleCommentAdded = (newComment) => {
    setComments(prev => [newComment, ...prev]);
  };

  const handleDelete = (id) => {
    setComments(prev => prev.filter(c => c._id !== id));
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Comments</h3>

      {user && <CommentInput postId={postId} onCommentAdded={handleCommentAdded} />}

      <div style={{ marginTop: '1.5rem' }}>
        {comments.map(comment => (
          <CommentItem key={comment._id} comment={comment} onDelete={handleDelete} />
        ))}

        {loading && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--textMuted)' }}>Loading...</div>}

        {!loading && hasMore && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Button variant="ghost" onClick={() => fetchComments(page + 1)}>
              Load more
            </Button>
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div className="empty-state">
            No comments yet. Be the first to share your thoughts.
          </div>
        )}
      </div>
    </div>
  );
};
