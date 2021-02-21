import { BufReader, BufWriter } from "../../deps.ts";
import { NatsConnectionData } from "../../interfaces/connections/nats.ts";
import { decoder, encoder } from "../../utils/clientUtil.ts";
import { NATSerror } from "./errors.ts";

export class NatsUtil {

    public static async writeIn(writer: BufWriter, message: string) {
        await writer.write(encoder.encode(message));
        await writer.flush();
    }

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
        return "";
    }

    public static createRequest(payload: string) {
      return `${payload}\r\n`;
    }

    public static async sendCommand(writer: BufWriter, reader: BufReader, payload: string): Promise<[string, string, boolean]> {
        await NatsUtil.writeIn(writer, NatsUtil.createRequest(payload));
        const [message, status] = [await this.readLine(reader), await this.readLine(reader)];
        const isOk = NatsUtil.validateStatus(status);
        return [message, status, isOk];
    }

    public static processResponse(response: string) {
      return response.lastIndexOf("\r\n");
    }

    public static async connect(writer: BufWriter, reader: BufReader, data: { [prop: string]: any }): Promise<[string, string, boolean]> {
        let command = `CONNECT`;
        command += ` ${JSON.stringify(data)}`;
        let [serverDataResponse, errorStatus, isOk] =  await this.sendCommand(writer, reader, command);
        if(serverDataResponse.includes("INFO")) {
          serverDataResponse = serverDataResponse.replace("INFO ", "").trim();
        }
        return [serverDataResponse, errorStatus, isOk];
    }

    public static validateStatus(okLine: string): boolean {
      const isError = okLine.startsWith("-ERR");
      if(isError) {
        let [,error] = okLine.substr(1).split("ERR ");
        throw new NATSerror(`(NATS) ${error}`);
      }
      return true;
    }

    public static async exec(writer: BufWriter, reader: BufReader, payload: string) {
      return await this.sendCommand(writer, reader, payload);
    }

    public static getMessageTypeFromHeader(header: string): "PING" | "PONG" | "MSG" | "INFO" | "OTHER" {
      if (header.includes("PING")) {
        return "PING"
      } else if(header.includes("PONG")) {
        return "PONG"
      } else if(header.includes("MSG")) {
        return "MSG"
      } else if(header.includes("INFO")) {
        return "INFO";
      } else {
        return "OTHER";
      }
    }

}