export function trackActivity(action, detail = '') {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem('pc_activity_history');
    const history = stored ? JSON.parse(stored) : [];
    history.unshift({
      id: Date.now().toString(36),
      action,
      detail,
      time: new Date().toLocaleString('vi-VN', {
        hour: '2-digit', minute: '2-digit',
        day: '2-digit', month: '2-digit', year: 'numeric'
      }),
      timestamp: Date.now(),
    });
    if (history.length > 50) history.length = 50;
    localStorage.setItem('pc_activity_history', JSON.stringify(history));
  } catch (e) {
    console.error('trackActivity error:', e);
  }
}
