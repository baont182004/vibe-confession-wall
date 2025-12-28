import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReactionBar from '../components/ReactionBar';
import { CommentList } from '../components/comments/CommentList';
import { CommentComposerSticky } from '../components/comments/CommentComposerSticky';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StreakChip } from '../components/profile/StreakChip';
import { formatRelativeTime } from '../utils/relativeTime';

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, hasMore: false });
  const commentListRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data.post);
      } catch (err) {
        console.error(err);
        setError('Không tìm thấy bài viết.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleStatsChange = (nextStats) => {
    if (!nextStats) return;
    setStats(nextStats);
  };

  const handleCommentAdded = (comment) => {
    commentListRef.current?.prependComment(comment);
  };

  const handleViewComments = () => {
    commentListRef.current?.scrollToBottom?.();
  };

  const timeLabel = formatRelativeTime(post?.createdAt);
  const hasStreak = post?.authorId?.currentStreak > 1;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-3 py-6 pb-12 sm:px-0">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-3">
          Quay lại
        </Button>
        <h1 className="gradient-text text-lg font-semibold tracking-[0.3em] uppercase">Bài viết</h1>
        <div style={{ width: 88 }} />
      </div>

      {loading && (
        <Card className="space-y-3 p-5">
          <div className="h-4 w-1/2 rounded bg-[var(--surface)]" />
          <div className="h-3 w-3/4 rounded bg-[var(--surface)]" />
          <div className="h-3 w-40 rounded bg-[var(--surface)]" />
        </Card>
      )}

      {error && (
        <Card className="p-5 text-sm text-[var(--red)]">
          {error}
        </Card>
      )}

      {post && (
        <Card className="space-y-5 border border-[var(--border)]">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar user={post.authorId} size={48} />
                <div>
                  <div className="text-lg font-semibold text-[var(--text)]">
                    {post.authorId?.nickname || 'Không rõ'}
                  </div>
                  {timeLabel && <div className="text-xs text-[var(--textMuted)]">{timeLabel}</div>}
                </div>
              </div>
              {hasStreak && <StreakChip count={post.authorId.currentStreak} />}
            </div>
            <p
              className="text-[var(--text)] leading-relaxed text-[1.05rem]"
              style={{ lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </section>
          <ReactionBar
            post={post}
            onViewThread={handleViewComments}
            showCommentCount
          />
        </Card>
      )}

      <Card className="border border-[var(--border)]">
        <div className="border-b border-[var(--divider)] px-5 py-3 text-sm font-semibold">
          Bình luận ({stats.total ?? post?.commentCount ?? 0})
        </div>
        <div className="h-[60vh] overflow-hidden">
          <CommentList
            ref={commentListRef}
            postId={id}
            className="p-5"
            bottomPadding={240}
            onStatsChange={handleStatsChange}
          />
        </div>
      </Card>

      {user && (
        <CommentComposerSticky
          postId={id}
          onCommentAdded={(comment) => {
            handleCommentAdded(comment);
            commentListRef.current?.scrollToBottom?.();
          }}
          className="sticky bottom-6 sm:bottom-10"
        />
      )}
    </div>
  );
};

export default PostPage;
