import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationsAPI, startNotificationSimulation, stopNotificationSimulation } from '../services/api-rbac';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    startNotificationSimulation((newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      stopNotificationSimulation();
    };
  }, []);

  const loadNotifications = async () => {
    const data = await notificationsAPI.getAll();
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
  };

  const markAsRead = async (id) => {
    await notificationsAPI.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await notificationsAPI.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const addNotification = (notification) => {
    notificationsAPI.create(notification).then(newNotif => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        loadNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};


