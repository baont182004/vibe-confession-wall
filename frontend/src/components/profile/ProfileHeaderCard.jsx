import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { ProfileNote } from './ProfileNote';
import { StreakChip } from './StreakChip';

export const ProfileHeaderCard = ({
  user,
  streakCount = 0,
  onEditNickname,
  onChangeAvatar,
  onNoteSaved,
  onNoteError,
}) => {
  const loginName = user?.nickname || 'Anonymous';
  const roleLabel = user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên';

  return (
    <Card className="p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar user={user} size={92} />
        <div className="flex-1 min-w-[220px] space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-2xl font-semibold">{loginName}</div>
            <Badge variant="secondary">{roleLabel}</Badge>
            <StreakChip count={streakCount} />
          </div>
          <ProfileNote note={user?.profileNote || ''} onSaved={onNoteSaved} onError={onNoteError} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onEditNickname}>
            Sửa biệt danh
          </Button>
          <Button variant="outline" size="sm" onClick={onChangeAvatar}>
            Đổi ảnh đại diện
          </Button>
        </div>
      </div>
    </Card>
  );
};
