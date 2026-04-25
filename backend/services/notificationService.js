const Notification = require('../models/Notification');
const { emitToUser } = require('../socket');

const notifyUser = async ({ recipientId, title, message, type = 'system', createdBy }) => {
  const notification = await Notification.create({
    recipient: recipientId,
    title,
    message,
    type,
    createdBy
  });

  emitToUser(String(recipientId), 'notification:new', {
    _id: notification._id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt
  });

  return notification;
};

module.exports = { notifyUser };
