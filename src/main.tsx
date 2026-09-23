import { StrictMode, Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, message: error instanceof Error ? error.message : 'Unknown application error' };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('SB1 runtime error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div dir="rtl" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ width: '100%', maxWidth: 560, background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 10px 40px rgba(0,0,0,.08)', textAlign: 'center' }}>
            <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 10 }}>SB1</div>
            <h1 style={{ fontSize: 22, margin: '0 0 10px' }}>حدث خطأ في تحميل التطبيق</h1>
            <p style={{ color: '#64748b', lineHeight: 1.8 }}>تم منع الصفحة البيضاء. أعد تحميل الموقع لإعادة تشغيل التطبيق.</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: 16, border: 0, borderRadius: 12, padding: '12px 24px', background: '#0d9488', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>إعادة تحميل SB1</button>
            <details style={{ marginTop: 20, textAlign: 'left', direction: 'ltr', color: '#94a3b8', fontSize: 12 }}>
              <summary>Technical details</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.message}</pre>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);
