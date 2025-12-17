import { Modal } from '../ui/Modal';
import { CommentList } from './CommentList';
import { Avatar } from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';

export const PostModal = ({ post, isOpen, onClose, user }) => {
  if (!post) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thread">
      <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Avatar user={post.authorId} size={40} />
          <div>
            <div style={{ fontWeight: 600 }}>{post.authorId.nickname || 'Anonymous'}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--textMuted)' }}>
              {formatDistanceToNow(new Date(post.createdAt))} ago
            </div>
          </div>
        </div>
        <div
          style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text)' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      <CommentList postId={post._id} user={user} />
    </Modal>
  );
};
