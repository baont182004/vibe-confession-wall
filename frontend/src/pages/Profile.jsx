import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { DEFAULT_AVATARS, getDefaultAvatarById, getAvatarSrc } from '../utils/avatar';
import { uploadAvatar, updateAvatarDefault, updateNickname } from '../services/api';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('defaults');
  const [selectedAvatarId, setSelectedAvatarId] = useState(user?.avatarId || 1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameStatus, setNicknameStatus] = useState('');
  const [nicknameSaving, setNicknameSaving] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const uploadNeedsFile = activeTab === 'upload' && !selectedFile;
  const defaultNeedsSelection = activeTab === 'defaults' && !selectedAvatarId;
  const isSaveDisabled = saving || uploadNeedsFile || defaultNeedsSelection;

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    setNickname(user?.nickname || '');
  }, [user?.nickname]);

  const displayName = user?.nickname || 'Anonymous';

  const openModal = () => {
    setStatus('');
    setError('');
    const currentDefault = DEFAULT_AVATARS.find((avatar) => avatar.src === user?.avatarUrl);
    setSelectedAvatarId(currentDefault?.id || user?.avatarId || 1);
    setSelectedFile(null);
    setPreviewUrl('');
    const hasUploadAvatar = user?.avatarUrl && user.avatarUrl.startsWith('/uploads/');
    setActiveTab(hasUploadAvatar ? 'upload' : 'defaults');
    setIsModalOpen(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a PNG, JPG, or WEBP image.');
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError('File is too large. Max size is 2MB.');
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
  };

  const handleSave = async () => {
    const tab = activeTab;
    setSaving(true);
    setError('');
    setStatus('');

    try {
      if (tab === 'upload') {
        if (!selectedFile) {
          setError('Choose an image to upload.');
          return;
        }
        const { data } = await uploadAvatar(selectedFile);
        updateUser({ ...data.user, avatarId: null, updatedAt: Date.now() });
        setStatus('Avatar updated successfully.');
        setIsModalOpen(false);
        return;
      }
      if (tab === 'defaults') {
        const selectedAvatar = DEFAULT_AVATARS.find((avatar) => avatar.id === selectedAvatarId) || DEFAULT_AVATARS[0];
        const { data } = await updateAvatarDefault(selectedAvatar.src);
        updateUser(data.user);
        setStatus('Avatar updated successfully.');
        setIsModalOpen(false);
        return;
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update avatar.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleNicknameSave = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setNicknameError('Nickname cannot be empty.');
      return;
    }

    setNicknameSaving(true);
    setNicknameError('');
    setNicknameStatus('');

    try {
      const { data } = await updateNickname(trimmed);
      updateUser(data.user);
      setNicknameStatus('Nickname updated.');
      setIsEditingNickname(false);
    } catch (err) {
      if (err.response?.status === 409) {
        setNicknameError('Nickname already taken.');
      } else if (err.response?.status === 400) {
        setNicknameError('Nickname must be 3-20 characters with no leading or trailing spaces.');
      } else {
        setNicknameError('Failed to update nickname.');
      }
    } finally {
      setNicknameSaving(false);
    }
  };

  const previewSrc = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (activeTab === 'defaults') return getDefaultAvatarById(selectedAvatarId);
    return getAvatarSrc(user);
  }, [previewUrl, activeTab, selectedAvatarId, user]);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: '1.5rem' }}>
      <Card style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <Avatar user={user} size={88} />
        <div style={{ flex: 1, minWidth: 220 }}>
          {isEditingNickname ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={20}
                placeholder="Enter display nickname"
                disabled={nicknameSaving}
              />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button variant="primary" size="sm" onClick={handleNicknameSave} disabled={nicknameSaving}>
                  {nicknameSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNickname(user?.nickname || '');
                    setNicknameError('');
                    setNicknameStatus('');
                    setIsEditingNickname(false);
                  }}
                  disabled={nicknameSaving}
                >
                  Cancel
                </Button>
              </div>
              {nicknameError && (
                <div className="notice is-error">{nicknameError}</div>
              )}
              {nicknameStatus && (
                <div className="notice">{nicknameStatus}</div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{displayName}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNicknameStatus('');
                  setNicknameError('');
                  setIsEditingNickname(true);
                }}
              >
                Edit nickname
              </Button>
            </div>
          )}
        </div>
        <Button variant="secondary" onClick={openModal}>
          Change avatar
        </Button>
      </Card>

      {status && (
        <div style={{ marginTop: '1rem' }} className="notice">
          {status}
        </div>
      )}
      {nicknameStatus && (
        <div style={{ marginTop: '1rem' }} className="notice">
          {nicknameStatus}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update your avatar">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="tabs" role="tablist" aria-label="Avatar options">
            <button
              type="button"
              className="tab"
              data-active={activeTab === 'upload'}
              role="tab"
              aria-selected={activeTab === 'upload'}
              onClick={() => {
                setError('');
                setActiveTab('upload');
              }}
            >
              Upload
            </button>
            <button
              type="button"
              className="tab"
              data-active={activeTab === 'defaults'}
              role="tab"
              aria-selected={activeTab === 'defaults'}
              onClick={() => {
                setError('');
                setActiveTab('defaults');
                setSelectedFile(null);
              }}
            >
              Default avatars
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Avatar src={previewSrc} size={56} />
            <div style={{ color: 'var(--textMuted)', fontSize: '0.9rem' }}>Preview</div>
          </div>
        </div>

        {activeTab === 'upload' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="avatar-upload" style={{ fontWeight: 600 }}>Upload an image</label>
              <input
                id="avatar-upload"
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                onChange={handleFileChange}
              />
              <div style={{ fontSize: '0.85rem', color: 'var(--textMuted)' }}>
                PNG, JPG, or WEBP. Max size 2MB.
              </div>
            </div>

            {previewUrl && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar src={previewUrl} size={120} />
              </div>
            )}
          </div>
        ) : (
          <div className="avatar-grid">
            {DEFAULT_AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                className={`avatar-option ${selectedAvatarId === avatar.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedAvatarId(avatar.id)}
                aria-label={`Select ${avatar.label} avatar`}
              >
                <Avatar src={avatar.src} size={64} />
              </button>
            ))}
          </div>
        )}

        {error && (
          <div style={{ marginTop: '1rem' }} className="notice is-error">
            {error}
          </div>
        )}
        {uploadNeedsFile && (
          <div style={{ marginTop: '1rem', color: 'var(--textMuted)', fontSize: '0.85rem' }}>
            Select an image to enable Save.
          </div>
        )}
        {defaultNeedsSelection && (
          <div style={{ marginTop: '1rem', color: 'var(--textMuted)', fontSize: '0.85rem' }}>
            Choose a default avatar to continue.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaveDisabled}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
