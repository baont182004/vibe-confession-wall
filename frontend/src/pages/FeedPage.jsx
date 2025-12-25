import { useEffect, useState } from 'react';
import { getPosts, deletePost } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { ThreadModal } from '../components/comments/ThreadModal';
import { PostCard } from '../components/PostCard';
import { PostComposer } from '../components/PostComposer';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bài viết này?')) return;
    try {
      await deletePost(id);
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="px-3 py-6 sm:px-0" style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <PostComposer user={user} onPostCreated={loadPosts} />
      {loading && (
        <Card className="space-y-3 p-5">
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-3 w-2/3" />
          <div className="skeleton h-3 w-1/2" />
        </Card>
      )}

      {!loading && posts.length === 0 && (
        <div className="empty-state">Không có bài viết nào. Hãy chia sẻ suy nghĩ đầu tiên của bạn.</div>
      )}

      <div className="space-y-4">
        {posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            currentUser={user}
            onViewThread={() => setSelectedPost(post)}
            onDelete={() => handleDelete(post._id)}
          />
        ))}
      </div>

      <ThreadModal
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
        user={user}
      />
    </div>
  );
}
