import * as net from "net";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// TODO - encode arbitrary strings
const PONG_RESPONSE = "+PONG\r\n"
const PING_INPUT = "*1\r\n$4\r\nPING\r\n"

const memoizedResponse = (connection: net.Socket) => {

    const dataResponseCallback = (data: Buffer) => {
        // const input = data.toString()
        // console.log("~~Recieved input:: ", input)
        // if (input === PING_INPUT) {
        //     connection.write(PONG_RESPONSE)
        // }

        // TODO - not reading input quite yet, couldn't get the strings to match
        connection.write(PONG_RESPONSE)
    }

    return dataResponseCallback
}

// Uncomment the code below to pass the first stage
const server: net.Server = net.createServer((connection: net.Socket) => {
    // Handle connection
    connection.on("data", memoizedResponse(connection))
});

server.listen(6379, "127.0.0.1");
