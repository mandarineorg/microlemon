import { NATSerror } from "./errors.ts";
import { NatsClient } from "./nats.ts";
import { NatsUtil } from "./natsUtil.ts";

export class NatsSubscription {

    private patterns: { [prop: string]: any } = {};

    constructor(private natsClient: NatsClient) {}

    public async subscribe(subject: string, queueGroup?: string): Promise<[string, string, boolean]> {
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

    public async *receive(): AsyncIterableIterator<any> {
        let forceReconnect = false;
        while (this.natsClient.isConnected()) {
          try {
                let message: string;
                try {
                    message = await NatsUtil.readLine(this.natsClient.getReader());
                } catch (err) {
                    if (err instanceof Deno.errors.BadResource) {
                        // Connection already closed.
                        this.natsClient.closeConnection();
                        break;
                    }
                    throw err;
                }
        
                yield message;
          }  finally {
            if ((!this.natsClient.isClosed() && !this.natsClient.isConnected()) || forceReconnect) {
              await this.natsClient.reconnect();
            }
          }
        }
      }

}