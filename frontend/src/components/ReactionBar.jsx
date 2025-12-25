import { useMemo, useState } from 'react';
import { toggleReaction } from '../services/api';
import { Button } from './ui/Button';

const reactions = [
  { type: 'heart', icon: '❤️', label: 'Yêu thích' },
  { type: 'hug', icon: '🤗', label: 'Ủng hộ' },
  { type: 'thanks', icon: '🙏', label: 'Cảm ơn' },
];

export default function ReactionBar({
  post,
  onViewThread,
  showCommentCount = true,
}) {
  const [counts, setCounts] = useState(post?.reactionCounts || {});
  const [busy, setBusy] = useState(false);

  const totalComments = useMemo(
    () => post?.commentCount ?? 0,
    [post]
  );

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
    <div className="flex flex-wrap items-center gap-2">
      {reactions.map(({ type, icon, label }) => (
        <Button
          key={type}
          variant="ghost"
          size="sm"
          onClick={() => onReact(type)}
          disabled={busy}
          aria-label={label}
          className="px-3"
        >
          <span aria-hidden="true">{icon}</span> {counts[type] ?? 0}
        </Button>
      ))}
      {showCommentCount && (
        <div className="border-r border-[var(--border)] h-5" />
      )}
      {showCommentCount && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewThread}
          disabled={!onViewThread}
          className="px-3"
        >
          Bình luận ({totalComments})
        </Button>
      )}
    </div>
  );
}
