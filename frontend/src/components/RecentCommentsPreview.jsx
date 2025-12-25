import { Button } from './ui/Button';
import { formatRelativeTime } from '../utils/relativeTime';

const RecentCommentsPreview = ({ comments = [], totalComments = 0, onViewThread }) => {
  if (!comments.length) return null;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-[var(--textMuted)]">Bình luận gần đây</div>
        <Button variant="ghost" size="xs" onClick={onViewThread}>
          Xem tất cả ({totalComments})
        </Button>
      </div>
      <div className="space-y-2">
        {comments.map((comment) => (
          <div key={comment._id} className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[var(--textMuted)]">
              <span className="font-semibold text-[var(--text)]">
                {comment.authorId?.nickname || 'Anonymous'}
              </span>
              <span aria-hidden>•</span>
              <span>{formatRelativeTime(comment.createdAt)}</span>
            </div>
            <p
              className="text-sm text-[var(--text)] leading-relaxed"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentCommentsPreview;
