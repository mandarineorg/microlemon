import { BufReader, BufWriter } from "../../deps.ts";
import { decoder, encoder } from "../../utils/clientUtil.ts";
import { EOFError, ErrorReplyError, InvalidStateError } from "./errors.ts";

/**
 * @see https://redis.io/topics/protocol
 */

/**
 * @description Represents the **simple string** type in the RESP2 protocol.
 */
export type Status = string;

/**
 * @description Represents the **integer** type in the RESP2 protocol.
 */
export type Integer = number;

/**
 * @description Represents the **bulk string** or **null bulk string** in the RESP2 protocol.
 */
export type Bulk = BulkString | BulkNil;

/**
 * @description Represents the **bulk string** type in the RESP2 protocol.
 */
export type BulkString = string;

/**
 * @description Represents the **null bulk string** in the RESP2 protocol.
 */
export type BulkNil = undefined;

/**
 * @description Represents the some type in the RESP2 protocol.
 */
export type Raw = Status | Integer | Bulk | ConditionalArray;

/**
 * @description Represents the **array** type in the RESP2 protocol.
 */
export type ConditionalArray = Raw[];

export type StatusReply = ["status", Status];
export type IntegerReply = ["integer", Integer];
export type BulkReply = ["bulk", Bulk];
export type ArrayReply = ["array", ConditionalArray];
export type ErrorReply = ["error", ErrorReplyError];
export type RedisRawReply = StatusReply | IntegerReply | BulkReply | ArrayReply;
export type RawReplyOrError = RedisRawReply | ErrorReply;

const IntegerReplyCode = ":".charCodeAt(0);
const BulkReplyCode = "$".charCodeAt(0);
const SimpleStringCode = "+".charCodeAt(0);
const ArrayReplyCode = "*".charCodeAt(0);
const ErrorReplyCode = "-".charCodeAt(0);

export class RedisUtil {

    public static async readLine(reader: BufReader): Promise<string> {
        const buf = new Uint8Array(1024);
        let loc = 0;
        let d: number | null = null;
        while ((d = await reader.readByte()) && d !== null) {
          if (d === "\r".charCodeAt(0)) {
            const d1 = await reader.readByte();
            if (d1 === "\n".charCodeAt(0)) {
              buf[loc++] = d;
              buf[loc++] = d1;
              return decoder.decode(new Deno.Buffer(buf.subarray(0, loc)).bytes());
            }
          }
          buf[loc++] = d;
        }
        throw new Error();
    }

    public static async readReply(reader: BufReader): Promise<RedisRawReply> {
        const res = await reader.peek(1);
        if (res === null) {
          throw new EOFError();
        }
        switch (res[0]) {
          case IntegerReplyCode:
            return ["integer", await this.readIntegerReply(reader)];
          case SimpleStringCode:
            return ["status", await this.readStatusReply(reader)];
          case BulkReplyCode:
            return ["bulk", await this.readBulkReply(reader)];
          case ArrayReplyCode:
            return ["array", await this.readArrayReply(reader)];
          case ErrorReplyCode:
            this.tryParseErrorReply(await this.readLine(reader));
        }
        throw new InvalidStateError();
      }

    public static createRequest(command: string, args: (string | number)[]): string {
        const _args = args.filter((v) => v !== void 0 && v !== null);
        let msg = "";
        msg += `*${1 + _args.length}\r\n`;
        msg += `$${command.length}\r\n`;
        msg += `${command}\r\n`;

        for (const arg of _args) {
          const val = String(arg);
          const bytesLen = encoder.encode(val).byteLength;
          msg += `$${bytesLen}\r\n`;
          msg += `${val}\r\n`;
        }
        
        return msg;
    }

    public static async sendCommand(writer: BufWriter, reader: BufReader, command: string, ...args: (number | string)[]): Promise<RedisRawReply> {
        const msg = this.createRequest(command, args);
        await writer.write(encoder.encode(msg));
        await writer.flush();
        return this.readReply(reader);
    }

    private static async readStatusReply(reader: BufReader): Promise<Status> {
        const line = await this.readLine(reader);
        if (line[0] === "+") {
          return line.substr(1, line.length - 3);
        }
        this.tryParseErrorReply(line);
    }
      
    private static async readIntegerReply(reader: BufReader): Promise<Integer> {
        const line = await this.readLine(reader);
        if (line[0] === ":") {
          const str = line.substr(1, line.length - 3);
          return parseInt(str);
        }
        this.tryParseErrorReply(line);
    }
      
    private static async readBulkReply(reader: BufReader): Promise<Bulk> {
        const line = await this.readLine(reader);
        if (line[0] !== "$") {
          this.tryParseErrorReply(line);
        }
        const sizeStr = line.substr(1, line.length - 3);
        const size = parseInt(sizeStr);
        if (size < 0) {
          // nil bulk reply
          return undefined;
        }
        const dest = new Uint8Array(size + 2);
        await reader.readFull(dest);
        return decoder.decode(
          new Deno.Buffer(dest.subarray(0, dest.length - 2)).bytes(),
        );
    }
      
    public static async readArrayReply(reader: BufReader): Promise<ConditionalArray> {
        const line = await this.readLine(reader);
        const argCount = parseInt(line.substr(1, line.length - 3));
        const result: ConditionalArray = [];
        for (let i = 0; i < argCount; i++) {
          const res = await reader.peek(1);
          if (res === null) {
            throw new EOFError();
          }
          switch (res[0]) {
            case SimpleStringCode:
              result.push(await this.readStatusReply(reader));
              break;
            case BulkReplyCode:
              result.push(await this.readBulkReply(reader));
              break;
            case IntegerReplyCode:
              result.push(await this.readIntegerReply(reader));
              break;
            case ArrayReplyCode:
              result.push(await this.readArrayReply(reader));
              break;
          }
        }
        return result;
    }
      
    private static tryParseErrorReply(line: string): never {
        const code = line[0];
        if (code === "-") {
          throw new ErrorReplyError(line);
        }
        throw new Error(`invalid line: ${line}`);
    }
      
}