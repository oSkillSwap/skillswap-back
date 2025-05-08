export default function messageSocketHandlers(io) {
  // Init socket when client-side connect to SocketIO instance
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connecté : ${socket.id}`);

    // Listen 'join' event from client-side
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`👤 Utilisateur ${userId} s'est connecté`);
    });

    // Listen 'sendMessage' event from client-side
    socket.on("sendMessage", async (messageData) => {
      // Trigger 'receiveMessage' event and send messageData to client-side
      io.to(+messageData.receiver_id).emit("receiveMessage", messageData);
      console.log("📨 Message envoyé :", messageData);
    });

    // Log .disconnect() from client-side
    socket.on("disconnect", () => {
      console.log(`❌ Déconnexion socket : ${socket.id}`);
    });
  });
}
