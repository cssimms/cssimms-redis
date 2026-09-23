import { describe, expect, test } from "bun:test";
import {
    INVALID_COMMAND,
    PONG_RESPONSE
} from "./constants";
import {
    commandRouter,
    CommandType,
    decodeRespInput,
} from "./main";

// ── decodeRespInput ──────────────────────────────────────────────────────────

describe("decodeRespInput", () => {
    test("parses a plain PING command", () => {
        expect(decodeRespInput("PING")).toEqual({ command: CommandType.PING, args: [] });
    });

    test("is case-insensitive for the command", () => {
        expect(decodeRespInput("ping")).toEqual({ command: CommandType.PING, args: [] });
        expect(decodeRespInput("Ping")).toEqual({ command: CommandType.PING, args: [] });
    });

    test("parses a plain ECHO command with one arg", () => {
        expect(decodeRespInput("ECHO hello")).toEqual({ command: CommandType.ECHO, args: ["hello"] });
    });

    test("parses a plain ECHO command with multiple args", () => {
        expect(decodeRespInput("ECHO foo bar")).toEqual({ command: CommandType.ECHO, args: ["foo", "bar"] });
    });

    test("returns undefined command for an unknown command", () => {
        const result = decodeRespInput("GET key");
        expect(result.command).toBeUndefined();
    });

    test("captures args even when command is unknown", () => {
        const result = decodeRespInput("GET key");
        expect(result.args).toEqual(["key"]);
    });

    // Bug: decodeRespInput splits by space, so RESP-encoded input is not parsed correctly.
    // e.g. "*1\r\n$4\r\nPING\r\n" is the wire format Redis clients send — the command
    // extracted will be "*1\r\n$4\r\nPING\r\n".toUpperCase(), not "PING".
    test("BUG: does not parse RESP wire-format PING (splits by space, not RESP tokens)", () => {
        const result = decodeRespInput("*1\r\n$4\r\nPING\r\n");
        // The whole string has no spaces so splitInput[0] is the full RESP blob — not "PING"
        expect(result.command).toBeUndefined();
    });

    test("BUG: does not parse RESP wire-format ECHO", () => {
        const result = decodeRespInput("*2\r\n$4\r\nECHO\r\n$5\r\nhello\r\n");
        expect(result.command).toBeUndefined();
    });
});

// ── commandRouter ────────────────────────────────────────────────────────────

describe("commandRouter", () => {
    test("PING returns +PONG\\r\\n", () => {
        expect(commandRouter({ command: CommandType.PING, args: [] })).toBe(PONG_RESPONSE);
    });

    test("undefined command returns invalid command error", () => {
        expect(commandRouter({ command: undefined, args: [] })).toBe(INVALID_COMMAND);
    });

    // Bug: ECHO is in CommandType but has no entry in controllerMap.
    // commandRouter falls through to the `?? ""` default and silently returns "".
    // The correct RESP response for ECHO hello would be "$5\r\nhello\r\n".
    test("BUG: ECHO returns empty string instead of echoing the argument", () => {
        const result = commandRouter({ command: CommandType.ECHO, args: ["hello"] });
        // Current (buggy) behaviour — documents the regression
        expect(result).toBe("");
        // Expected correct behaviour (would pass once the bug is fixed):
        // expect(result).toBe("$5\r\nhello\r\n");
    });

    test("BUG: ECHO with no args also returns empty string instead of an error or empty bulk string", () => {
        const result = commandRouter({ command: CommandType.ECHO, args: [] });
        expect(result).toBe("");
    });

    test("PING ignores any extra args", () => {
        expect(commandRouter({ command: CommandType.PING, args: ["ignored"] })).toBe(PONG_RESPONSE);
    });
});
