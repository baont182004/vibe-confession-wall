import { useEffect, useRef, useState } from 'react';
import { Modal } from '../ui/Modal';
import { CommentList } from './CommentList';
import ReactionBar from '../ReactionBar';
import { CommentComposerSticky } from './CommentComposerSticky';
import { Avatar } from '../ui/Avatar';
import { StreakChip } from '../profile/StreakChip';
import { formatRelativeTime } from '../../utils/relativeTime';

export const ThreadModal = ({ post, isOpen, onClose, user }) => {
  const commentListRef = useRef(null);
  const [commentStats, setCommentStats] = useState({
    total: post?.commentCount ?? 0,
    pages: 1,
    hasMore: false,
  });

  useEffect(() => {
    if (!post) return;
    setCommentStats({
      total: post.commentCount ?? 0,
      pages: 1,
      hasMore: false,
    });
  }, [post]);

  if (!post) return null;

  const timeLabel = formatRelativeTime(post.createdAt);
  const hasStreak = post.authorId?.currentStreak > 1;

  const handleCommentAdded = (comment) => {
    commentListRef.current?.prependComment(comment);
  };

  const handleStatsChange = (stats) => {
    if (!stats) return;
    setCommentStats(stats);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bài viết"
      bodyClassName="flex h-full flex-col overflow-hidden"
      bodyStyle={{ padding: 0, overflowY: 'hidden', maxHeight: '80vh' }}
    >
      <div className="flex h-full flex-col" style={{ minHeight: 0 }}>
        <section className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--surface2)] px-5 pt-5 pb-4 space-y-4">
          <div className="flex items-start gap-3">
            <Avatar user={post.authorId} size={48} />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-[var(--text)]">
                  {post.authorId.nickname || 'Anonymous'}
                </span>
                {hasStreak && (
                  <StreakChip count={post.authorId.currentStreak} title="Chuỗi ngày hoạt động" />
                )}
              </div>
              {timeLabel && (
                <div className="text-xs text-[var(--textMuted)]">{timeLabel}</div>
              )}
            </div>
          </div>
          <div
            className="text-[var(--text)] leading-relaxed"
            style={{ lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <div className="pt-2">
            <ReactionBar
              post={post}
              commentCount={commentStats.total}
              onViewThread={() => {}}
              showCommentCount={false}
              commentLabel="Xem bình luận"
            />
          </div>
        </section>

        <div className="flex flex-1 min-h-0 flex-col bg-[var(--surface)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 pb-3 flex-shrink-0">
            <div className="text-sm font-semibold">Bình luận ({commentStats.total})</div>
            <button
              type="button"
              className="text-xs text-[var(--textMuted)] hover:text-[var(--text)]"
              onClick={() => commentListRef.current?.fetchNext?.()}
              hidden={!commentStats.hasMore}
            >
              Hiển thị thêm
            </button>
          </div>
          <CommentList
            ref={commentListRef}
            postId={post._id}
            className="flex-1 min-h-0 px-5 pt-3"
            bottomPadding={200}
            onStatsChange={handleStatsChange}
          />
        </div>

        {user && (
          <CommentComposerSticky
            postId={post._id}
            onCommentAdded={(comment) => {
              handleCommentAdded(comment);
              commentListRef.current?.scrollToBottom?.();
            }}
            autoFocus={isOpen}
          />
        )}
      </div>
    </Modal>
  );
};
