export const StreakChip = ({ count = 0, title = 'Chuỗi ngày hoạt động' }) => {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 rounded-full border border-warning-border bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning-strong shadow-[0_0_10px_rgba(255,210,115,0.28)] transition hover:brightness-110 hover:scale-[1.02]"
    >
      🔥 {count}
    </span>
  );
};
