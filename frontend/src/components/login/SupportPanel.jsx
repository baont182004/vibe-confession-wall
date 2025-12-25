import { useCallback, useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import supportMessages from '../../data/supportMessages';

const STORAGE_KEY = 'dearpeer.supportSeed';

const readSeed = () => {
  if (typeof window === 'undefined') return 0;
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = Number(stored);
    if (!Number.isNaN(parsed)) return parsed;
  }
  const initial = Math.floor(Math.random() * 1000) + 1;
  sessionStorage.setItem(STORAGE_KEY, String(initial));
  return initial;
};

const saveSeed = (value) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, String(value));
};

const SupportPanel = () => {
  const [seed, setSeed] = useState(() => readSeed());
  const pickIndex = useMemo(() => Math.abs(seed) % supportMessages.length, [seed]);
  const message = supportMessages[pickIndex];

  const shuffleMessage = useCallback(() => {
    const next = seed + 1;
    saveSeed(next);
    setSeed(next);
  }, [seed]);

  return (
    <Card className="support-panel">
      <div className="support-panel__label">Chia sẻ nhẹ</div>
      <div className="support-panel__question">{message.question}</div>
      <p className="support-panel__comfort">{message.comfort}</p>
      <div className="support-panel__action">
        <span className="support-panel__action-label">Hành động nhỏ</span>
        <p>{message.action}</p>
      </div>
      <div className="support-panel__footer">
        <Button variant="outline" size="md" onClick={shuffleMessage}>
          Đổi lời nhắn
        </Button>
      </div>
    </Card>
  );
};

export default SupportPanel;
