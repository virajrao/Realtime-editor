import { io } from "socket.io-client";

export const initSocket = async () => {
    const options = {
        forceNew: true,
        reconnectionAttempts: Infinity,
        timeout: 10000,
        transports: ['websocket'], // Allow both websocket and polling
    };
    
    
    return io(process.env.REACT_APP_BACKEND_URL, options);

};