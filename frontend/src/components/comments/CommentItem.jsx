import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { voteComment, deleteComment } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';

export const CommentItem = ({ comment, onDelete }) => {
  const { user } = useAuth();
  const [votes, setVotes] = useState(comment.voteCounts || { likes: 0, dislikes: 0, score: 0 });
  const [myVote, setMyVote] = useState(comment.myVote || 0);

  const handleVote = async (value) => {
    const previousVote = myVote;
    const previousVotes = { ...votes };

    let newLikes = votes.likes;
    let newDislikes = votes.dislikes;

    if (myVote === value) {
      setMyVote(0);
      if (value === 1) newLikes--;
      else newDislikes--;
    } else {
      setMyVote(value);
      if (myVote === 1) newLikes--;
      else if (myVote === -1) newDislikes--;

      if (value === 1) newLikes++;
      else newDislikes++;
    }

    setVotes({ ...votes, likes: newLikes, dislikes: newDislikes });

    try {
      const { data } = await voteComment(comment._id, value);
      setVotes(data.counts);
      setMyVote(data.myVote);
    } catch (err) {
      setMyVote(previousVote);
      setVotes(previousVotes);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(comment._id);
      if (onDelete) onDelete(comment._id);
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const isOwner = user && user._id === comment.authorId._id;
  const isAdmin = user && user.role === 'admin';

  return (
    <div style={{ padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <Avatar user={comment.authorId} size={32} />
        <div>
          <span style={{ fontWeight: 600 }}>{comment.authorId.nickname || 'Anonymous'}</span>
          <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--textMuted)' }}>
            {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt))} ago
          </span>
        </div>
      </div>

      <p style={{ color: 'var(--text)', marginBottom: '0.75rem', lineHeight: '1.6' }}>
        {comment.content}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote(1)}
          style={{ color: myVote === 1 ? 'var(--blue)' : 'var(--textMuted)' }}
        >
          <ThumbsUp size={16} /> {votes.likes}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote(-1)}
          style={{ color: myVote === -1 ? 'var(--orange)' : 'var(--textMuted)' }}
        >
          <ThumbsDown size={16} />
        </Button>

        {(isOwner || isAdmin) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            style={{ marginLeft: 'auto', color: 'var(--textMuted)' }}
          >
            <Trash2 size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};
