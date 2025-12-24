import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const AccountSection = ({ onLogout, loggingOut }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Tài khoản</div>
          <div className="text-xs text-[var(--textMuted)]">Thoát khỏi phiên đăng nhập hiện tại.</div>
        </div>
        <Button variant="primary" size="sm" onClick={onLogout} disabled={loggingOut}>
          {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </Button>
      </div>
    </Card>
  );
};
