import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';

export const CloseWeekDialog = ({ open, onOpenChange, onConfirm }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đóng tuần?</DialogTitle>
          <DialogDescription>
            Sau khi đóng, bạn không thể thêm/sửa/xóa. Có thể mở lại bất cứ lúc nào.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button variant="primary" onClick={onConfirm}>Đóng tuần</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
