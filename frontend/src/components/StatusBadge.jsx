const config = {
  TODO:        { label: 'To Do',       cls: 'bg-slate-700/60 text-slate-300 border-slate-600' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-500/15 text-blue-300 border-blue-500/40' },
  DONE:        { label: 'Done',        cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const { label, cls } = config[status] ?? config.TODO
  const sz = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
  return (
    <span className={`font-mono border rounded-md inline-block ${sz} ${cls}`}>
      {label}
    </span>
  )
}
