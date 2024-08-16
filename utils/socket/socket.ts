"use client";

import { Socket, io } from "socket.io-client";

export const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL!, {
  autoConnect: false
});
