"use client";
import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/app/hooks/useNotifications";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return "✅";
      case "error": return "❌";
      case "warning": return "⚠️";
      default: return "ℹ️";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[color:var(--muted)] hover:text-foreground transition-colors"
        aria-label="Notificaciones"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Badge de contador */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[color:var(--accent)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[color:var(--background)] border border-white/15 rounded-xl shadow-2xl backdrop-blur-sm z-50">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificaciones</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-sm text-[color:var(--accent)] hover:text-[color:var(--accent)]/80"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-[color:var(--muted)]">
                <div className="text-2xl mb-2">🔔</div>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors cursor-pointer ${
                    !notification.read ? "bg-[color:var(--accent)]/5" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-medium text-sm ${!notification.read ? "text-foreground" : "text-[color:var(--muted)]"}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-[color:var(--muted)] ml-2">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[color:var(--muted)] line-clamp-2">
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[color:var(--accent)] rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 bg-white/5 text-center">
              <button className="text-sm text-[color:var(--accent)] hover:text-[color:var(--accent)]/80">
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
