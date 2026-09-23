import { INVALID_COMMAND, PONG_RESPONSE } from "./constants";
import { CommandType, type NormalizedInput } from "./main";

// Exporting all controller functions for easier testing.
export type ControllerFunction = (args: string[]) => string

export const handleEcho: ControllerFunction = (args: string[]) => {
    return args.join()
}
export const commandRouter = (input: NormalizedInput): string => {
    const { command, args } = input

    if (command === undefined) {
        return (INVALID_COMMAND)
    }

    const controllerMap = new Map<CommandType, ControllerFunction>([
        [CommandType.PING, (_) => PONG_RESPONSE],
        [CommandType.ECHO, handleEcho],
    ]);

    const commandFunction = controllerMap.get(command)
    if (!commandFunction) {
        return (INVALID_COMMAND)
    }

    return commandFunction(args) ?? "";
};
