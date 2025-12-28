import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { voteComment, deleteComment } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { formatRelativeTime } from '../../utils/relativeTime';

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
    if (!window.confirm('Xóa bình luận này?')) return;
    try {
      await deleteComment(comment._id);
      if (onDelete) onDelete(comment._id);
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const isOwner = user && user._id === comment.authorId._id;
  const isAdmin = user && user.role === 'admin';

  const timeLabel = formatRelativeTime(comment.createdAt);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="flex items-start gap-3">
        <Avatar user={comment.authorId} size={32} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--textMuted)]">
            <span className="font-semibold text-[var(--text)]">
              {comment.authorId.nickname || 'Anonymous'}
            </span>
            <span aria-hidden>•</span>
            <span>{timeLabel}</span>
          </div>
          <p className="text-sm text-[var(--text)] leading-relaxed mt-1">{comment.content}</p>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote(1)}
              className={myVote === 1 ? 'text-[var(--blue)]' : 'text-[var(--textMuted)]'}
            >
              <ThumbsUp size={16} /> {votes.likes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote(-1)}
              className={myVote === -1 ? 'text-warning-strong' : 'text-[var(--textMuted)]'}
            >
              <ThumbsDown size={16} /> {votes.dislikes}
            </Button>
            {(isOwner || isAdmin) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="ml-auto text-[var(--textMuted)]"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
