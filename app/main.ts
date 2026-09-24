import * as net from "net";
import { HEALTHY_HTTP_RESPONSE, RETURN_NEWLINE } from "./constants";
import { commandRouter } from "./controller";

console.log("Starting Server...");

export enum CommandType {
    PING = "PING",
    ECHO = "ECHO",
}

export interface NormalizedInput {
    command: CommandType | undefined,
    args: string[]
}

// Going to assume that input is always valid RESP - we can implement the invalid input cases later
export const decodeRespInput = (input: string): NormalizedInput => {

    // This feels like cheating a bit because TS is recieving the pieces of our command split by the \r\n, but it's
    // all fair for practice so continue with the "cheating" way. The character by character approach would be more
    // appropriate for a Go impelmentation anyway.
    const splitCommandInput = input.split(RETURN_NEWLINE)
    console.debug('split input', splitCommandInput)
    // Coming through as "*2", for example.
    const numberOfArguments = Number(splitCommandInput[0].replace('*', ''))
    console.debug('args count: ', numberOfArguments)

    // Coming through as "$4", for example
    const lengthOfCommanString = Number(splitCommandInput[1].replace('$', ''))
    console.debug('command length: ', lengthOfCommanString)

    const commandInput = splitCommandInput[2] as CommandType
    console.debug('Parsed command type:', commandInput)

    // For now, we'll just strip out the length specifications and the trailing empty string. If we were parsing this by character
    // The lengths would be critical for parsing the details.
    const argumentParams = splitCommandInput.slice(3).reduce<[]>((acc, input: string) => {
        if ((input.match("$") ?? []).length > 1) {
            return acc
        }
        const nextAcc = [...acc]

        // input is never??
        nextAcc.push(input)

        return acc
    }, [])
    console.debug('Parsed args: ', argumentParams)


    const matchedCommand = Object.keys(CommandType)
        .find((command): command is CommandType => command === commandInput);

    return { command: matchedCommand, args: argumentParams }

}


const memoizedResponse = (connection: net.Socket) => {

    const dataResponseCallback = (data: Buffer) => {
        console.log("~~ Recieved Request ~~")
        const incomingData = data.toString()

        if (incomingData.match(/HEAD/)?.length || 0 > 0) {
            // HEAD requests are treated as healthchecks for now
            console.debug("~~ Health Check returning healthy ~~")
            connection.write(HEALTHY_HTTP_RESPONSE)
            connection.end()

            return;
        }

        // TODO - not reading input quite yet, couldn't get the strings to match
        const normalizedInput = decodeRespInput(incomingData)
        console.log("~~ Recieved Input ~~", normalizedInput)

        const responseString = commandRouter(normalizedInput)
        console.log("~~ Returning data ~~", responseString)

        connection.write(responseString)
        connection.end()
    }

    return dataResponseCallback
}

// Guard server startup so this module can be imported in tests
if (import.meta.main) {
    const DEFAULT_PORT = 6379 // default port for redis


    if (process.env.DEBUG !== 'true') {
        console.debug = () => { }
    }

    const host = process.env.HOST || "127.0.0.1"
    const port = Number(process.env.PORT ? process.env.POST : DEFAULT_PORT) || DEFAULT_PORT

    const server: net.Server = net.createServer((connection: net.Socket) => {
        connection.on("data", memoizedResponse(connection))
    });

    server.listen(port, host);
    console.log(`Server ready in ${process.env.DEBUG ? "DEBUG" : "STANDARD"} mode on ${host}:${port}.`)
}
