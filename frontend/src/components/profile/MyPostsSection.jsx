import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ThreadModal } from '../comments/ThreadModal';
import { getPosts } from '../../services/api';
import { formatRelativeTime } from '../../utils/relativeTime';

const PAGE_SIZE = 10;

const getExcerpt = (content = '') => {
  const text = content.replace(/<[^>]*>/g, '').trim();
  if (!text) return 'Bài viết trống.';
  return text.length > 140 ? `${text.slice(0, 140)}...` : text;
};

export const MyPostsSection = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  const loadPosts = async (nextPage, append = false) => {
    if (!user?._id) return;
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const { data } = await getPosts(nextPage);
      const fetched = Array.isArray(data?.posts) ? data.posts : [];
      const mine = fetched.filter((post) => post?.authorId?._id === user._id);
      setPosts((prev) => (append ? [...prev, ...mine] : mine));
      setHasMore(fetched.length >= PAGE_SIZE);
      setPage(nextPage);
    } catch {
      setPosts((prev) => (append ? prev : []));
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPosts(1);
  }, [user?._id]);

  const emptyState = useMemo(() => !loading && posts.length === 0, [loading, posts.length]);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-semibold">Bài viết của bạn</div>
      </div>

      {loading && (
        <div className="space-y-3">
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-3 w-2/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      )}

      {emptyState && (
        <div className="empty-state">Bạn chưa đăng bài nào.</div>
      )}

      {!loading && posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post._id} className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">Bài viết</div>
                <div className="text-xs text-[var(--textMuted)]">
                    {formatRelativeTime(post.createdAt)}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPost(post)}>
                  Xem
                </Button>
              </div>
              <div className="mt-2 text-sm text-[var(--textMuted)]">{getExcerpt(post.content)}</div>
            </div>
          ))}
        </div>
      )}

      {!loading && hasMore && (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadPosts(page + 1, true)}
            disabled={loadingMore}
          >
            {loadingMore ? 'Đang tải...' : 'Tải thêm'}
          </Button>
        </div>
      )}

      <ThreadModal
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
        user={user}
      />
    </Card>
  );
};
