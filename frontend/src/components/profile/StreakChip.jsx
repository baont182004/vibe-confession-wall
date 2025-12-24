export const StreakChip = ({ count = 0, title = 'Chuỗi ngày hoạt động' }) => {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 rounded-full border border-[var(--accent-3)]/50 bg-[var(--accent-3)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--accent-3)] shadow-[0_0_10px_rgba(255,180,84,0.18)] transition hover:brightness-110 hover:scale-[1.02]"
    >
      🔥 {count}
    </span>
  );
};
