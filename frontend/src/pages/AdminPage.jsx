import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Navigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function AdminPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const load = async () => {
      const o = await api.get('/admin/overview');
      setOverview(o.data);
      const lp = await api.get('/admin/posts');
      setPosts(lp.data.items);
      const lc = await api.get('/admin/comments');
      setComments(lc.data.items);
    };
    load();
  }, []);

  if (user.role !== 'admin') return <Navigate to="/login" replace />;

  const deletePost = async (id) => {
    if (!confirm('Delete post?')) return;
    await api.delete(`/admin/posts/${id}`);
    alert('Deleted');
    setPosts(posts.filter(p => p._id !== id));
  };

  const deleteComment = async (id) => {
    if (!confirm('Delete comment?')) return;
    await api.delete(`/admin/comments/${id}`);
    alert('Deleted');
    setComments(comments.filter(c => c._id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ margin: 0 }}>Admin Workspace</h2>
      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <Card style={{ padding: '1rem' }}>Users: {overview.usersCount}</Card>
          <Card style={{ padding: '1rem' }}>Posts: {overview.postsCount}</Card>
          <Card style={{ padding: '1rem' }}>Comments: {overview.commentsCount}</Card>
        </div>
      )}
      <Card style={{ padding: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Posts</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', color: 'var(--text)', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--textMuted)' }}>
                <th style={{ paddingBottom: '0.5rem' }}>Author</th>
                <th style={{ paddingBottom: '0.5rem' }}>Content</th>
                <th style={{ paddingBottom: '0.5rem' }}>Created</th>
                <th style={{ paddingBottom: '0.5rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p._id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.6rem 0' }}>{p.authorId.nickname}</td>
                  <td style={{ padding: '0.6rem 0', color: 'var(--textMuted)' }}>{p.content.slice(0, 80)}...</td>
                  <td style={{ padding: '0.6rem 0' }}>{new Date(p.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '0.6rem 0' }}>
                    <Button variant="destructive" size="sm" onClick={() => deletePost(p._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card style={{ padding: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Comments</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', color: 'var(--text)', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--textMuted)' }}>
                <th style={{ paddingBottom: '0.5rem' }}>Author</th>
                <th style={{ paddingBottom: '0.5rem' }}>Content</th>
                <th style={{ paddingBottom: '0.5rem' }}>Created</th>
                <th style={{ paddingBottom: '0.5rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(c => (
                <tr key={c._id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.6rem 0' }}>{c.authorId.nickname}</td>
                  <td style={{ padding: '0.6rem 0', color: 'var(--textMuted)' }}>{c.content.slice(0, 80)}...</td>
                  <td style={{ padding: '0.6rem 0' }}>{new Date(c.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '0.6rem 0' }}>
                    <Button variant="destructive" size="sm" onClick={() => deleteComment(c._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
