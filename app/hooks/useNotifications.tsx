"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  createdAt: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Cargar notificaciones del localStorage al inicializar
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convertir las fechas de string a Date
        const withDates = parsed.map((n: Notification & { createdAt: string }) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }));
        setNotifications(withDates);
      } catch {
        // Si hay error, crear notificaciones iniciales
        createInitialNotifications();
      }
    } else {
      // Primera vez, crear notificaciones iniciales
      createInitialNotifications();
    }
  }, []);

  // Guardar en localStorage cuando cambien las notificaciones
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const createInitialNotifications = () => {
    const initialNotifications: Notification[] = [
      {
        id: "welcome",
        title: "¡Bienvenido!",
        message: "Tu cuenta ha sido creada exitosamente",
        type: "success",
        createdAt: new Date(),
        read: false,
      },
      {
        id: "premium-info", 
        title: "Analytics Premium",
        message: "Descubre las nuevas funcionalidades de analytics en tiempo real",
        type: "info",
        createdAt: new Date(Date.now() - 2 * 60 * 1000),
        read: false,
      },
    ];
    setNotifications(initialNotifications);
  };

  const addNotification = useCallback((notif: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notif,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        markAsRead, 
        markAllAsRead, 
        removeNotification, 
        unreadCount 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
