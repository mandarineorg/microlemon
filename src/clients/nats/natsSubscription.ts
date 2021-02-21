import { NATSerror } from "./errors.ts";
import { NatsClient } from "./nats.ts";
import { NatsUtil } from "./natsUtil.ts";
import { NatsSubscriptionResponse } from "./natsCommonInterfaces.ts";

const replaceLast = (x: string, y: string, z: string) => {
    var a = x.split("");
    a[x.lastIndexOf(y)] = z;
    return a.join("");
}

export class NatsSubscription {

    private patterns: { [prop: string]: any } = {};

    constructor(private natsClient: NatsClient) {}

    public async subscribe(subject: string, queueGroup?: string): Promise<[string, string, boolean]> {
        
        if(subject.includes(" ")) {
            throw new NATSerror("The subject of a subscription cannot contain white spaces");
        }

        const clientId = this.natsClient.getNatsServerData().client_id;
        if(clientId) {
            if(queueGroup) {
                return await this.natsClient.exec(`SUB ${subject} ${queueGroup} ${clientId}`);
            } else {
                return await this.natsClient.exec(`SUB ${subject} ${clientId}`);
            }
        } else { 
            throw new NATSerror("A subscription requires a valid client id, make sure your connection is established.");
        }
    }

    public async unSubscribe(maxMessages?: number): Promise<[string, string, boolean]> {
        const clientId = this.natsClient.getNatsServerData().client_id;
        if(clientId) {
            if(maxMessages) {
                return await this.natsClient.exec(`UNSUB ${clientId} ${maxMessages}`);
            } else {
                return await this.natsClient.exec(`UNSUB ${clientId}`);
            }
        } else { 
            throw new NATSerror("NATS cannot unsubscribe an unexistent client");
        }
    }

    public async publish(subject: string, payload: string | object, replyTo?: string): Promise<[string, string, boolean]> {
        const finalPayload = (typeof payload === "object") ? JSON.stringify(payload) : payload;
        if(replyTo) {
            return await this.natsClient.exec(`PUB ${subject} ${replyTo} ${finalPayload.length}\r\n${finalPayload}`);
        } else {
            return await this.natsClient.exec(`PUB ${subject} ${finalPayload.length}\r\n${finalPayload}`);
        }
    }

    public async *receive(): AsyncIterableIterator<NatsSubscriptionResponse> {
        let forceReconnect = false;
        while (this.natsClient.isConnected()) {
          try {
                let subsMessage: NatsSubscriptionResponse;
                try {
                    const reader = async () => await NatsUtil.readLine(this.natsClient.getReader());
                    const header = await reader();
                    const type = NatsUtil.getMessageTypeFromHeader(header);

                    if(type === "MSG") {
                        const message = await reader();
                        const processedMessage = replaceLast(replaceLast(message, "\r", ""), "\n", "")

                        let cleanHeader = replaceLast(replaceLast(header, "\r", ""), "\n", "");
                        let [, subject, sid, responseLength] = cleanHeader.split(" ");

                        subsMessage = {
                            type,
                            header: {
                                subject,
                                sid: parseInt(sid),
                                responseLength: parseInt(responseLength)
                            },
                            message: processedMessage
                        }
                    } else {
                        subsMessage = {
                            type,
                            header: header,
                            message: ""
                        }
                    }

                } catch (err) {
                    if (err instanceof Deno.errors.BadResource) {
                        // Connection already closed.
                        this.natsClient.closeConnection();
                        break;
                    }
                    throw err;
                }
        
                yield subsMessage;
          }  finally {
            if ((!this.natsClient.isClosed() && !this.natsClient.isConnected()) || forceReconnect) {
              await this.natsClient.reconnect();
            }
          }
        }
      }

}