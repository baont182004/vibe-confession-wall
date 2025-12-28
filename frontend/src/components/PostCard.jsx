import { useMemo, useState } from 'react';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/Popover';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import ReactionBar from './ReactionBar';
import RecentCommentsPreview from './RecentCommentsPreview';
import { StreakChip } from './profile/StreakChip';
import { formatRelativeTime } from '../utils/relativeTime';

const COLLAPSE_LIMIT = 420;

export const PostCard = ({ post, currentUser, onViewThread, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const author = post?.authorId;
  const canManage = currentUser && (currentUser.role === 'admin' || author?._id === currentUser._id);
  const hasStreak = author?.currentStreak && author.currentStreak > 1;
  const truncated = !expanded && (post.content || '').length > COLLAPSE_LIMIT;

  const timeLabel = useMemo(() => formatRelativeTime(post?.createdAt), [post]);
  const totalComments = post?.commentCount ?? (post?.featuredComments?.length || 0);
  const previewComments = useMemo(() => {
    const candidates = post?.featuredComments || [];
    if (!candidates.length) return [];
    const selected = [candidates[0]];
    const second = candidates[1];
    if (
      second &&
      candidates[0]?.content?.length <= 120 &&
      second?.content?.length <= 120
    ) {
      selected.push(second);
    }
    return selected;
  }, [post]);

  return (
    <div className="card glass rounded-2xl border border-[var(--border)] p-5 space-y-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Avatar user={author} size={46} />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[var(--text)]">
                {author?.nickname || 'Anonymous'}
              </span>
              {hasStreak && (
                <StreakChip count={author.currentStreak} title="Chuỗi ngày hoạt động" />
              )}
            </div>
            {timeLabel && <div className="text-xs text-[var(--textMuted)]">{timeLabel}</div>}
          </div>
        </div>
        {canManage && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="rounded-full border border-transparent p-1 text-[var(--textMuted)] transition hover:border-[var(--divider)] hover:text-[var(--text)]"
                aria-label="Thêm hành động"
              >
                <MoreHorizontal size={20} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-2" align="end">
              <button
                type="button"
                onClick={onDelete}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-[var(--red)] hover:bg-[var(--red)]/10"
              >
                Xóa bài viết
              </button>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div>
        <button
          type="button"
          className="text-left w-full"
          onClick={onViewThread}
        >
          <div
            className="text-sm leading-relaxed text-[var(--text)]"
            style={!expanded ? {
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            } : undefined}
          >
            <span dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </button>
        {truncated && !expanded && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(true)}
            >
              Xem thêm
            </Button>
          </div>
        )}
      </div>

      <ReactionBar
        post={post}
        commentCount={totalComments}
        onViewThread={onViewThread}
      />
      <RecentCommentsPreview
        comments={previewComments}
        totalComments={totalComments}
        onViewThread={onViewThread}
      />
    </div>
  );
};
