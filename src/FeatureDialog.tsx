import { ReactNode, useEffect, useRef } from "react";

export default function FeatureDialog({ title, close, children, className = "" }: { title: string; close: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className={`workspace-modal ${className}`} aria-label={title} onCancel={close} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <div className="modal-heading"><h2>{title}</h2><button type="button" aria-label="Close dialog" onClick={close}>×</button></div>
    {children}
  </dialog>;
}
