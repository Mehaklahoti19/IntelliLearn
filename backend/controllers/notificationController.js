const { prisma } = require('../config/database');

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// PUT /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { read: true },
    });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark as read' });
  }
};

// PUT /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark all as read' });
  }
};

// Helper: create a notification (used internally)
const createNotification = async (userId, { title, message, type = 'info', link = null }) => {
  try {
    return await prisma.notification.create({
      data: { userId, title, message, type, link },
    });
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

module.exports = { getNotifications, markRead, markAllRead, createNotification };
