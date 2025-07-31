// import { Server } from 'http';
// import app from './app';
// import seedSuperAdmin from './app/DB';
// import config from './config';

// const port = config.port || 5000;

// async function main() {
//   const server: Server = app.listen(port, () => {
//     console.log('Server is running on port ', port);
//     seedSuperAdmin();
//   });
//   const exitHandler = () => {
//     if (server) {
//       server.close(() => {
//         console.info('Server closed!');
//       });
//     }
//     process.exit(1);
//   };

//   process.on('uncaughtException', error => {
//     console.log(error);
//     exitHandler();
//   });

//   process.on('unhandledRejection', error => {
//     console.log(error);
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
import { handleSocketEvents } from "./app/modules/socket/socketHandler";



const port = config.port || 5000;

async function main() {
  const httpServer = createServer(app);
      seedSuperAdmin();

  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin:  [
      'http://localhost:3001',
      'http://104.236.194.254:5700',
      'http://localhost:3000',
      'http://localhost:5700',
      'https://my-app-nine-tau-26.vercel.app',
      'https://www.worldcybersecurityforum.org',
      'https://worldcybersecurityforum.org',
      "http://localhost:5173",
      "*"
    ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

 

  setIOInstance(io);

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    handleSocketEvents(io, socket);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
  // Start HTTP Server
  httpServer.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    seedSuperAdmin();
  });

  // Graceful shutdown
  const exitHandler = () => {
    httpServer.close(() => {
      console.info("🛑 Server closed!");
    });
    process.exit(1);
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
