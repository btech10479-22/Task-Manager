export default function DeleteConfirmModal({ task, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-sm animate-slide-up p-6 shadow-2xl">
        <h2 className="font-semibold text-slate-100 mb-2">Delete task?</h2>
        <p className="text-sm text-slate-400 mb-6">
          "<span className="text-slate-200">{task?.title}</span>" will be permanently deleted.
        </p>
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
