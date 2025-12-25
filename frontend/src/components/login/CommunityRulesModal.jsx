import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

const rules = [
  'Giữ riêng tư và chỉ chia sẻ khi bạn sẵn sàng.',
  'Không dùng ngôn ngữ công kích, kể cả ẩn ý.',
  'Không trao đổi thông tin cá nhân nhạy cảm.',
  'Hỏi han, lắng nghe trước khi phản hồi.',
  'Tôn trọng ranh giới và giới hạn của nhau.',
  'Sự ấm áp bắt đầu từ sự chân thành.',
];

export const CommunityRulesModal = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Quy tắc cộng đồng">
    <div className="modal-rules">
      <ul>
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <div className="mt-4 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </div>
  </Modal>
);
