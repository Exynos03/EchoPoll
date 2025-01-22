import http from 'http'

async function main() {
    const httpServer = http.createServer()

    const PORT = 8080

    httpServer.listen(PORT, () => {
        console.log(`Server is up and running on ${PORT}`)
    })
}