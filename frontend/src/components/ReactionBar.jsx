import { useState } from 'react';
import { toggleReaction } from '../services/api';
import { Button } from './ui/Button';

export default function ReactionBar({ post }) {
  const [counts, setCounts] = useState(post.reactionCounts);
  const [busy, setBusy] = useState(false);

  const onReact = async (type) => {
    if (busy) return;
    setBusy(true);
    try {
      const { data } = await toggleReaction(post._id, type);
      setCounts(data.counts);
    } catch (e) {
      console.error('Failed to react', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onReact('heart')}
        disabled={busy}
        style={{ padding: '4px 8px' }}
      >
        ❤️ {counts.heart}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onReact('hug')}
        disabled={busy}
        style={{ padding: '4px 8px' }}
      >
        🫂 {counts.hug}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onReact('thanks')}
        disabled={busy}
        style={{ padding: '4px 8px' }}
      >
        🙏 {counts.thanks}
      </Button>
    </div>
  );
}
