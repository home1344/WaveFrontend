import { io } from "socket.io-client";

// Replace with your backend URL
const socket = io("http://192.168.0.67:5000");

export default socket;
