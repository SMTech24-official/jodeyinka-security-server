


// // server.ts
// import { createServer } from "http";
// import { Server as SocketIOServer } from "socket.io";
// import app from "./app";
// import config from "./config";
// import seedSuperAdmin from "./app/DB";
// import { setIOInstance } from "./app/utils/socket";
// import { handleSocketEvents } from "./app/modules/socket/socketHandler";

// export const connectedUsers = new Map<string, string>(); // userId -> socketId

// const port = config.port || 5000;

// async function main() {
//   const httpServer = createServer(app);
//       seedSuperAdmin();

//   // Initialize Socket.IO
//   const io = new SocketIOServer(httpServer, {
//     cors: {
//       origin:  [
//       'http://localhost:3001',
//       'http://104.236.194.254:5700',
//       'http://localhost:3000',
//       'http://localhost:5700',
//       'https://my-app-nine-tau-26.vercel.app',
//       'https://www.worldcybersecurityforum.org',
//       'https://worldcybersecurityforum.org',
//       "http://localhost:5173",
//       "https://jodeyinka.code-commando.com",
//       "*"
//     ],
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//   });

 

//   setIOInstance(io);

//   io.on('connection', (socket) => {
//     console.log('A user connected:', socket.id);

//     handleSocketEvents(io, socket);

//     socket.on('disconnect', () => {
//       console.log('User disconnected:', socket.id);
//     });
//   });
//   // Start HTTP Server
//   httpServer.listen(port, () => {
//     console.log(`🚀 Server is running on port ${port}`);
//     seedSuperAdmin();
//   });

//   // Graceful shutdown
//   const exitHandler = () => {
//     httpServer.close(() => {
//       console.info("🛑 Server closed!");
//     });
//     process.exit(1);
//   };

//   process.on("uncaughtException", (error) => {
//     console.error("❗ Uncaught Exception:", error);
//     exitHandler();
//   });

//   process.on("unhandledRejection", (error) => {
//     console.error("❗ Unhandled Rejection:", error);
//     exitHandler();
//   });
// }

// main();




// server.ts
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import config from "./config";
import seedSuperAdmin from "./app/DB";
import { setIOInstance } from "./app/utils/socket";
import { handleSocketEvents, connectedUsers } from "./app/modules/socket/socketHandler";

const port = config.port || 5000;

async function main() {
  // HTTP server তৈরি
  const httpServer = createServer(app);

  // Superadmin seed (একবারই)
  await seedSuperAdmin();

  // Socket.IO init
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "https://my-app-nine-tau-26.vercel.app",
        "https://www.worldcybersecurityforum.org",
        "https://worldcybersecurityforum.org",
        "https://jodeyinka.code-commando.com",
        "*",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // IO globally set
  setIOInstance(io);

  // Socket.IO connection handle
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // handle custom socket events
    handleSocketEvents(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      // connectedUsers থেকে remove করা
      for (const [userId, sockId] of connectedUsers.entries()) {
        if (sockId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
    });
  });

  // HTTP server listen
  httpServer.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });

  // Graceful shutdown
  const exitHandler = () => {
    httpServer.close(() => {
      console.info("🛑 Server closed!");
      process.exit(1);
    });
  };

  process.on("uncaughtException", (error) => {
    console.error("❗ Uncaught Exception:", error);
    exitHandler();
  });

  process.on("unhandledRejection", (error) => {
    console.error("❗ Unhandled Rejection:", error);
    exitHandler();
  });
}

main();

