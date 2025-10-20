// src/interface/websocketServer.ts

//ESTO ES UNA PLANTILLA QUE PODEMOS USAR PARA LUEGO MODIFICARLA A NUESTRO GUSTO
//HAY QUE INVESTIGAR MUCHO MAS
import { Server, Socket } from "socket.io";
import { config } from "../config";

export function initWebSocketServer(httpServer: any) {
  const io = new Server(httpServer, {
    cors: { origin: "*" }, // permite que el dashboard (frontend) se conecte
  });

  console.log("✅ WebSocket inicializado");

  // Evento: un cliente se conecta
  io.on("connection", (socket: Socket) => {
    console.log(`🟢 Cliente conectado: ${socket.id}`);

    //
    // 🔹 Eventos que escucha el socket (peticiones del frontend)
    //
    socket.on("solicitar-causas", async () => {
      const causas = await obtenerCausasUrgentes();
      socket.emit("actualizacion-causas", causas);
    });

    socket.on("solicitar-donaciones", async () => {
      const donaciones = await obtenerDonaciones();
      socket.emit("actualizacion-donaciones", donaciones);
    });

    socket.on("solicitar-animales", async () => {
      const animales = await obtenerAnimales();
      socket.emit("actualizacion-animales", animales);
    });

    //
    // 🔹 Enviar actualizaciones automáticas a todos los clientes
    //
    const interval = setInterval(async () => {
      try {
        const causas = await obtenerCausasUrgentes();
        io.emit("actualizacion-causas", causas);

        const donaciones = await obtenerDonaciones();
        io.emit("actualizacion-donaciones", donaciones);
      } catch (error) {
        console.error("Error actualizando datos:", error);
      }
    }, 10000); // cada 10 segundos

    //
    // 🔹 Cuando el cliente se desconecta
    //
    socket.on("disconnect", () => {
      console.log(`🔴 Cliente desconectado: ${socket.id}`);
      clearInterval(interval);
    });
  });
}
