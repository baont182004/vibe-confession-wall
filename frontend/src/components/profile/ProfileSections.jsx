import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Checkbox } from '../ui/Checkbox';

export const BasicInfoCard = ({ user, onEditNickname }) => {
  const nickname = user?.nickname || 'Anonymous';
  const userId = user?._id ? `...${user._id.slice(-6)}` : 'Chưa có dữ liệu';
  const timezone = user?.timezone || 'Asia/Ho_Chi_Minh';

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Thông tin cơ bản</div>
        <Badge variant="outline">Bảo mật</Badge>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="text-[var(--textMuted)]">Tên hiển thị</div>
          <div className="font-medium">{nickname}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[var(--textMuted)]">Biệt danh</div>
          <div className="flex items-center gap-2">
            <span className="font-medium">@{nickname.toLowerCase()}</span>
            <Button variant="ghost" size="sm" onClick={onEditNickname}>
              Sửa
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[var(--textMuted)]">Múi giờ</div>
          <div className="font-medium">{timezone}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[var(--textMuted)]">ID người dùng</div>
          <div className="font-medium">{userId}</div>
        </div>
      </div>
      <div className="text-xs text-[var(--textMuted)]">
        Chỉ hiển thị những thông tin cần thiết để bảo vệ quyền riêng tư.
      </div>
    </Card>
  );
};

export const PreferencesCard = ({ isPrivate = false }) => {
  return (
    <Card className="p-4 space-y-4">
      <div className="text-sm font-semibold">Tùy chọn hiển thị</div>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="font-medium">Chế độ riêng tư</div>
          <div className="text-xs text-[var(--textMuted)]">
            Ẩn hoạt động trên Bảng tin công khai. (Chưa hỗ trợ đồng bộ)
          </div>
        </div>
        <Checkbox checked={isPrivate} disabled />
      </div>
      <div className="text-xs text-[var(--textMuted)]">Tính năng đang phát triển.</div>
    </Card>
  );
};

export const SecurityCard = ({ onLogout, loggingOut }) => {
  return (
    <Card className="p-4 space-y-4">
      <div className="text-sm font-semibold">Bảo mật / Tài khoản</div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-medium">Đổi mật khẩu</div>
            <div className="text-xs text-[var(--textMuted)]">Hiện chưa hỗ trợ đổi mật khẩu.</div>
          </div>
          <Button variant="secondary" size="sm" disabled>
            Chưa hỗ trợ
          </Button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-medium">Đăng xuất</div>
            <div className="text-xs text-[var(--textMuted)]">Thoát khỏi phiên đăng nhập hiện tại.</div>
          </div>
          <Button variant="primary" size="sm" onClick={onLogout} disabled={loggingOut}>
            {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </Button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-medium">Đăng xuất mọi thiết bị</div>
            <div className="text-xs text-[var(--textMuted)]">Sẽ đăng xuất trên tất cả thiết bị khác.</div>
          </div>
          <Button variant="secondary" size="sm" disabled>
            Chưa hỗ trợ
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const StatsCard = ({ stats }) => {
  const currentStreak = stats?.currentStreak ?? null;
  const bestStreak = stats?.bestStreak ?? null;

  return (
    <Card className="p-4 space-y-4">
      <div className="text-sm font-semibold">Thống kê hoạt động</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] p-3">
          <div className="text-xs text-[var(--textMuted)]">Chuỗi hiện tại</div>
          <div className="text-lg font-semibold">{currentStreak ?? '-'}</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] p-3">
          <div className="text-xs text-[var(--textMuted)]">Chuỗi tốt nhất</div>
          <div className="text-lg font-semibold">{bestStreak ?? '-'}</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface2)] p-3 col-span-2">
          <div className="text-xs text-[var(--textMuted)]">Tổng số nhật ký</div>
          <div className="text-lg font-semibold">Chưa có dữ liệu</div>
        </div>
      </div>
    </Card>
  );
};

export const DangerZoneCard = () => {
  return (
    <Card className="p-4 space-y-4 border border-[var(--red)]/40 bg-[var(--red)]/5">
      <div className="text-sm font-semibold text-[var(--red)]">Vùng nguy hiểm</div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium">Xóa tài khoản</div>
          <div className="text-xs text-[var(--textMuted)]">
            Hành động này không thể hoàn tác. Hiện chưa hỗ trợ.
          </div>
        </div>
        <Button variant="destructive" size="sm" disabled>
          Chưa hỗ trợ
        </Button>
      </div>
    </Card>
  );
};
