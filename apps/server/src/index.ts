import http from 'http'
import SocketService from './services/socket'

async function main() {
    const socketService = new SocketService()
    const httpServer = http.createServer()

    const PORT = 8080

    socketService.io.attach(httpServer)
    httpServer.listen(PORT, () => {
        console.log(`Server is up and running on ${PORT}`)
    })

    socketService.initListeners()
}

main()