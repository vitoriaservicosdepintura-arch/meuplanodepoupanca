export default function ProgressBar({
  percentage,
  height = "h-3",
}: {
  percentage: number;
  height?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percentage));
  return (
    <div className={`w-full overflow-hidden rounded-full bg-white/10 ${height}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-[width] duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
