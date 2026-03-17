import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Info, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

const typeIcon = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  reminder: <Clock className="h-4 w-4 text-yellow-500" />,
  progress: <TrendingUp className="h-4 w-4 text-green-500" />,
  suggestion: <Sparkles className="h-4 w-4 text-purple-500" />,
};

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch { /* silent */ }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll}
                className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={`px-4 py-3 border-b dark:border-gray-700 last:border-0 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">{typeIcon[n.type] || typeIcon.info}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
