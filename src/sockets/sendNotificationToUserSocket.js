export const sendNotificationToUser = (socket) => {
  socket.on("FE_SEND_NOTIFICATION", (notification) => {
    socket.broadcast.emit("BE_SEND_NOTIFICATION", notification);
  });
};
