import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { getComments } from '../../services/api';
import { CommentItem } from './CommentItem';

export const CommentList = forwardRef(
  ({ postId, className, style, bottomPadding = 140, onStatsChange }, ref) => {
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const listRef = useRef(null);
    const scrollAnchorRef = useRef(0);

    const fetchComments = useCallback(
      async (pageNumber = 1) => {
        if (!postId) return;
        setLoading(true);
        setError('');

        const listEl = listRef.current;
        if (pageNumber > 1 && listEl) {
          scrollAnchorRef.current = listEl.scrollHeight - listEl.scrollTop;
        } else {
          scrollAnchorRef.current = 0;
        }

        try {
          const { data } = await getComments(postId, pageNumber);
          const totalPages = data.pages ?? 1;
          const nextHasMore = pageNumber < totalPages;
          const newTotal = data.total ?? 0;
          setTotal(newTotal);
          setHasMore(nextHasMore);
          onStatsChange?.({ total: newTotal, pages: totalPages, hasMore: nextHasMore });
          if (pageNumber === 1) {
            setComments(data.comments);
          } else {
            setComments((prev) => [...prev, ...data.comments]);
          }
          setPage(pageNumber);

          if (pageNumber > 1 && listEl) {
            requestAnimationFrame(() => {
              if (listEl) {
                listEl.scrollTop = listEl.scrollHeight - scrollAnchorRef.current;
              }
            });
          }
        } catch (err) {
          console.error(err);
          if (!pageNumber || pageNumber === 1) {
            setComments([]);
          }
          setError('Không thể tải bình luận.');
        } finally {
          setLoading(false);
        }
      },
      [postId, onStatsChange]
    );

    useImperativeHandle(
      ref,
      () => ({
        prependComment: (comment) => {
          setComments((prev) => [comment, ...prev]);
          setTotal((prevTotal) => {
            const nextTotal = prevTotal + 1;
            onStatsChange?.({ total: nextTotal, pages: Math.max(1, page), hasMore });
            return nextTotal;
          });
        },
        fetchNext: () => {
          if (loading || !hasMore) return;
          fetchComments(page + 1);
        },
        scrollToBottom: () => {
          const listEl = listRef.current;
          listEl?.scrollTo({ top: listEl.scrollHeight, behavior: 'smooth' });
        },
      }),
      [fetchComments, hasMore, loading, onStatsChange, page]
    );

    useEffect(() => {
      if (!postId) return;
      fetchComments(1);
    }, [fetchComments, postId]);

    useEffect(() => {
      if (!import.meta.env.DEV || !listRef.current) return;
      const node = listRef.current;
      const report = () => {
        const { clientHeight, scrollHeight } = node;
        const overflowY = getComputedStyle(node).overflowY;
        console.info('[CommentList scroll]', { clientHeight, scrollHeight, overflowY });
      };
      report();
      window.addEventListener('resize', report);
      return () => window.removeEventListener('resize', report);
    }, []);

    return (
      <div
        ref={listRef}
        className={cn(
          'flex h-full min-h-0 flex-col overflow-y-scroll space-y-3 thread-comment-scroll',
          className
        )}
        style={{
          padding: '0 0.25rem',
          paddingBottom: bottomPadding,
          scrollbarGutter: 'stable',
          ...style,
        }}
      >
          {error && (
            <div className="text-xs text-[var(--red)] text-center">{error}</div>
          )}
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
          {loading && (hasMore || comments.length === 0) && (
            <div className="text-xs text-[var(--textMuted)] text-center">Đang tải...</div>
          )}
          {!loading && !comments.length && !error && (
            <div className="empty-state py-4 text-[var(--textMuted)]">
              Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ suy nghĩ.
            </div>
          )}
        </div>
    );
  }
);
