import { Server } from "socket.io"
import Redis from "ioredis";


const pub = new Redis({

})
const sub = pub.duplicate()

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