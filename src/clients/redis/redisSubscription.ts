import { InvalidStateError } from "./errors.ts";
import { RedisClient } from "./redis.ts";
import { RedisUtil } from "./util.ts";

export interface RedisPubSubMessage {
    pattern?: string;
    channel: string;
    message: string;
}

export class RedisSubscription {

    private patterns: { [prop: string]: any } = {};
    private channels: { [prop: string]: any } = {};

    constructor(private redisClient: RedisClient) {
    }

    public async patternSubscribe(...patterns: string[]) {
        await RedisUtil.sendCommand(this.redisClient.getWriter(), this.redisClient.getReader(), "PSUBSCRIBE", ...patterns);
        for (const pat of patterns) {
          this.patterns[pat] = true;
        }
    }
    
    public async patternUnsubscribe(...patterns: string[]) {
        await RedisUtil.sendCommand(this.redisClient.getWriter(), this.redisClient.getReader(), "PUNSUBSCRIBE", ...patterns);
        for (const pat of patterns) {
          delete this.patterns[pat];
        }
    }
    
    public async channelSubscribe(...channels: string[]) {
        await RedisUtil.sendCommand(this.redisClient.getWriter(), this.redisClient.getReader(), "SUBSCRIBE", ...channels);
        for (const chan of channels) {
          this.channels[chan] = true;
        }
        return this;
    }
    
      async channelUnsubscribe(...channels: string[]) {
        await RedisUtil.sendCommand(this.redisClient.getWriter(), this.redisClient.getReader(), "UNSUBSCRIBE", ...channels);
        for (const chan of channels) {
          delete this.channels[chan];
        }
        return this;
      }
    
    public async *receive(): AsyncIterableIterator<RedisPubSubMessage> {
        let forceReconnect = false;
        while (this.redisClient.isConnected()) {
          try {
                let rep: string[];
                try {
                    rep = (await RedisUtil.readArrayReply(this.redisClient.getReader())) as string[];
                } catch (err) {
                    if (err instanceof Deno.errors.BadResource) {
                        // Connection already closed.
                        this.redisClient.closeConnection();
                        break;
                    }
                    throw err;
                }
                const ev = rep[0];
        
                if (ev === "message" && rep.length === 3) {
                    yield {
                        channel: rep[1],
                        message: rep[2],
                    };
                } else if (ev === "pmessage" && rep.length === 4) {
                    yield {
                        pattern: rep[1],
                        channel: rep[2],
                        message: rep[3],
                    };
                }
          } catch (error) {
            if (error instanceof InvalidStateError || error instanceof Deno.errors.BadResource) {
              forceReconnect = true;
            } else throw error;
          } finally {
            if ((!this.redisClient.isClosed() && !this.redisClient.isConnected()) || forceReconnect) {
              await this.redisClient.reconnect();
              forceReconnect = false;
    
              if (Object.keys(this.channels).length > 0) {
                await this.channelSubscribe(...Object.keys(this.channels));
              }
              if (Object.keys(this.patterns).length > 0) {
                await this.patternSubscribe(...Object.keys(this.patterns));
              }
            }
          }
        }
      }
    
    public async close() {
        try {
          await this.channelUnsubscribe(...Object.keys(this.channels));
          await this.patternUnsubscribe(...Object.keys(this.patterns));
        } finally {
          this.redisClient.closeConnection();
        }
    }

}

