import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard';
import { EditNicknameModal } from '../components/profile/EditNicknameModal';
import { ChangeAvatarModal } from '../components/profile/ChangeAvatarModal';
import { MyPostsSection } from '../components/profile/MyPostsSection';
import { useStreak } from '../hooks/useStreak';

const Toast = ({ message, variant = 'success', onClose }) => {
  if (!message) return null;
  const styles = variant === 'error'
    ? 'border-[var(--red)]/40 bg-[var(--red)]/10 text-[var(--red)]'
    : 'border-warning-border bg-warning-soft text-warning-strong';

  return (
    <div className={`fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 text-sm shadow-lg ${styles}`}>
      <div className="flex items-center gap-3">
        <div>{message}</div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </div>
  );
};

const SkeletonBlock = ({ lines = 3 }) => (
  <Card className="p-4 space-y-3">
    <div className="skeleton h-4 w-24" />
    {Array.from({ length: lines }).map((_, idx) => (
      <div key={idx} className="skeleton h-3 w-full" />
    ))}
  </Card>
);

export default function ProfilePage() {
  const { user, loading, refreshUser, updateUser } = useAuth();
  const { streak } = useStreak();
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = setTimeout(() => setToastMessage(''), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleNicknameSuccess = (nextUser) => {
    updateUser(nextUser);
    setToastVariant('success');
    setToastMessage('Đã cập nhật biệt danh.');
  };

  const handleAvatarSuccess = (nextUser) => {
    updateUser(nextUser);
    setToastVariant('success');
    setToastMessage('Đã cập nhật ảnh đại diện.');
  };

  const handleAvatarError = (message) => {
    setToastVariant('error');
    setToastMessage(message || 'Cập nhật thất bại, thử lại.');
  };

  const handleNoteSaved = (nextUser) => {
    updateUser(nextUser);
    setToastVariant('success');
    setToastMessage('Đã cập nhật ghi chú.');
  };

  const handleNoteError = (message) => {
    setToastVariant('error');
    setToastMessage(message || 'Cập nhật thất bại, thử lại.');
  };

  if (loading) {
    return (
      <div className="container space-y-4">
        <SkeletonBlock lines={4} />
        <SkeletonBlock lines={5} />
        <SkeletonBlock lines={2} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container space-y-4">
        <Card className="p-6 space-y-3">
          <div className="text-lg font-semibold">Không thể tải hồ sơ</div>
          <div className="text-sm text-[var(--textMuted)]">Vui lòng thử lại hoặc đăng nhập lại.</div>
          <Button variant="primary" size="sm" onClick={refreshUser}>
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container space-y-4">
      <Toast message={toastMessage} variant={toastVariant} onClose={() => setToastMessage('')} />

      <ProfileHeaderCard
        user={user}
        streakCount={streak?.currentStreak || 0}
        onEditNickname={() => setShowNicknameModal(true)}
        onChangeAvatar={() => setShowAvatarModal(true)}
        onNoteSaved={handleNoteSaved}
        onNoteError={handleNoteError}
      />

      <MyPostsSection user={user} />

      <EditNicknameModal
        isOpen={showNicknameModal}
        onClose={() => setShowNicknameModal(false)}
        currentNickname={user?.nickname}
        onSuccess={handleNicknameSuccess}
      />

      <ChangeAvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        user={user}
        onSuccess={handleAvatarSuccess}
        onError={handleAvatarError}
      />
    </div>
  );
}
