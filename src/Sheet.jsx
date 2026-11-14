import { useEffect, useRef } from "react";

// Modal con overlay sobre <dialog>: el navegador maneja foco, Esc y el fondo.
// En celular sale desde abajo; en pantallas grandes queda centrado.
export default function Sheet({ open, onClose, title, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className="mx-auto mb-0 mt-auto w-full max-w-full max-h-[88dvh] overflow-y-auto overscroll-contain rounded-t-[18px] border-0 bg-surface p-0 sm:m-auto sm:max-w-lg sm:rounded-[18px]"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-hairline bg-surface px-5 py-2.5">
        <h2 className="font-display text-[21px] font-semibold tracking-[.2px]">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Cerrar"
          className="grid size-11 place-items-center rounded-full bg-surface-2 text-xl text-ink transition hover:opacity-80 active:scale-95">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className="px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]">{children}</div>
    </dialog>
  );
}
