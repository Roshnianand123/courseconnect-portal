'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type || 'info'}`} role="alert">
          <div style={{ flexShrink: 0, marginTop: '2px' }}>
            {toast.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />}
            {toast.type === 'error' && <AlertCircle size={18} style={{ color: 'var(--accent-rose)' }} />}
            {(!toast.type || toast.type === 'info') && <Info size={18} style={{ color: 'var(--primary)' }} />}
          </div>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            {toast.message && <div className="toast-msg">{toast.message}</div>}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-subtle)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
