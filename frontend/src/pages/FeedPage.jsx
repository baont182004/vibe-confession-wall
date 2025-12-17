import { useEffect, useState } from 'react';
import { getPosts, createPost, deletePost } from '../services/api';
import ReactionBar from '../components/ReactionBar';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextArea } from '../components/ui/Input';
import { PostModal } from '../components/comments/PostModal';
import { Avatar } from '../components/ui/Avatar';
import { MessageSquare, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data } = await getPosts(1);
      setPosts(data.posts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await createPost(content);
      setContent('');
      loadPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(id);
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <Card style={{ padding: '1.5rem' }}>
        <form onSubmit={handlePost}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Avatar user={user} size={48} />
            <div style={{ flex: 1 }}>
              <TextArea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="What's on your mind?"
                maxLength={2000}
                className="input--textarea"
                style={{ minHeight: '90px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                <div style={{ color: 'var(--textMuted)', fontSize: '0.85rem' }}>
                  Share a calm, supportive update.
                </div>
                <Button type="submit" disabled={!content.trim()} variant="primary">
                  <Send size={16} /> Post
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Card>

      {loading && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: '0.75rem' }} />
          <div className="skeleton" style={{ height: 12, width: '75%', marginBottom: '0.5rem' }} />
          <div className="skeleton" style={{ height: 12, width: '65%' }} />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="empty-state">No posts yet. Start the conversation with your first update.</div>
      )}

      {posts.map(post => (
        <Card key={post._id} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Avatar user={post.authorId} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{post.authorId.nickname || 'Anonymous'}</div>
                <div style={{ color: 'var(--textMuted)', fontSize: '0.85rem' }}>
                  {formatDistanceToNow(new Date(post.createdAt))} ago
                </div>
              </div>
              {(user.role === 'admin' || post.authorId._id === user._id) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(post._id)}
                  aria-label="Delete post"
                >
                  <Trash2 size={18} />
                </Button>
              )}
            </div>

            <div
              style={{ marginBottom: '1.2rem', lineHeight: '1.7', fontSize: '1.02rem', whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <ReactionBar post={post} />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPost(post)}
              >
                <MessageSquare size={18} /> Comments
              </Button>
            </div>
          </div>

          {post.featuredComments && post.featuredComments.length > 0 && (
            <div style={{ backgroundColor: 'var(--surface2)', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--textMuted)', marginBottom: '0.75rem', fontWeight: 600 }}>
                Recent comments
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {post.featuredComments.map(comment => (
                  <div key={comment._id} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {comment.authorId.nickname || 'Anonymous'}
                    </span>
                    <span style={{ color: 'var(--textMuted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {comment.content}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPost(post)}
                style={{ marginTop: '0.75rem' }}
              >
                View all comments
              </Button>
            </div>
          )}
        </Card>
      ))}

      <PostModal
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
        user={user}
      />
    </div>
  );
}
