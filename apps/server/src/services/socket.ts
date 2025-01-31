import { Server } from "socket.io"
import Redis from "ioredis";
import { json } from "stream/consumers";
import { channel } from "diagnostics_channel";

const pub = new Redis({
    host: 'caching-1bc93745-sumitghosh345-7eac.d.aivencloud.com',
    port: 21188,
    username: 'default',
    password: 'AVNS_icGwyX3hjKpv-A10aPe'
})
const sub = new Redis({
    host: 'caching-1bc93745-sumitghosh345-7eac.d.aivencloud.com',
    port: 21188,
    username: 'default',
    password: 'AVNS_icGwyX3hjKpv-A10aPe'
})

class SocketService {
    private _io: Server;
    
    constructor() {
        console.log("Init socket service...")
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*",
            }
        })
        sub.subscribe("MESSAGES")
    }

    public initListeners() {
        const io = this._io
        console.log("Init Socket listeners...")
        io.on("connect", (socket) => {
            console.log("Client connected : ", socket.id)
        
            socket.on('event:message', async ({ message }: {message: string}) => {
                await pub.publish("MESSAGES", JSON.stringify({message}))
            })
        })

        sub.on('message', async (channel, msg) => {
            if(channel === "MESSAGES") {
                io.emit("message", msg)
            }
        })
    }

    get io() {
        return this._io
    }
}

export default SocketService