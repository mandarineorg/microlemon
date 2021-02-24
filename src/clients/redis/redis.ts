import { Client } from "../../interfaces/client.ts";
import { ConnectionData, ConnectionOptions } from "../../interfaces/connection.ts";
import { RedisConnection } from "../../interfaces/connections/redis.ts";
import { ClientUtil, decoder, encoder } from "../../utils/clientUtil.ts";
import { BufReader, BufWriter } from "../../deps.ts";
import { RedisRawReply, RedisUtil} from "./util.ts";
import { RedisSubscription } from "./redisSubscription.ts";

export class RedisClient implements Client {

    private connection!: Deno.Conn;
    private generalOptions!: ConnectionData;
    private fullClientOptions!: RedisConnection;

    private reader!: BufReader;
    private writer!: BufWriter;

    private connected!: boolean;
    private closed!: boolean;

    // Redis
    private redisSubscription!: RedisSubscription;

    public async connect(options: RedisConnection): Promise<Client> {

        this.generalOptions = Object.assign({}, {
            transport: options.transport,
            options: {
                host: options.options.host,
                port: options.options.port,
                retryAttempts: options.options.retryAttempts,
                retryDelay: options.options.retryDelay
            }
        });

        this.fullClientOptions = Object.assign({}, options);

        this.connection = await Deno.connect({
            port: this.generalOptions.options.port || ClientUtil.getDefaultPort(this.generalOptions.transport),
            hostname: this.generalOptions.options.host
        });

        this.reader = new BufReader(this.connection);
        this.writer = new BufWriter(this.connection);

        const { username, password } = options.options;
        try {
            await this.authenticate({ username, password });
            this.connected = true;
            this.closed = false;
            return this;
        } catch (error) {
            this.closeConnection();
            throw error;
        }
    }

    public async authenticate(data: { [prop: string]: any }): Promise<RedisRawReply> {
        const { username, password } = data;
        if(password && !username) {
            return RedisUtil.sendCommand(this.writer, this.reader, "AUTH", password);
        } else if (password && username) {
            return RedisUtil.sendCommand(this.writer, this.reader, "AUTH", username, password);
        } else {
            throw new Error();
        }
    }

    public async reconnect(): Promise<void> {
        if (!this.reader.peek(1)) {
            throw new Error("Client is closed.");
        } else {
            try {
                await RedisUtil.sendCommand(this.writer, this.reader, "PING");
                this.connected = true;
            } catch (error) {
                let retries = 0;
                const resolvable = new Promise((resolve, reject) => {
                    const reconnectionInterval = setInterval(async () => {
                        if(retries > this.getRetryAttemps()) {
                            this.closeConnection();
                            clearInterval(reconnectionInterval);
                            reject(new Error("Could not re-establish connection"));
                        }

                        try {
                            this.closeConnection();
                            await this.connect(this.getConnectionOptions());
                            await RedisUtil.sendCommand(this.getWriter(), this.getReader(), "PING");
                            this.connected = true;
                            retries = 0;
                            clearInterval(reconnectionInterval);
                            // @ts-ignore
                            resolve();
                        } catch (error) {

                        }
                        finally {
                            retries = retries + 1;
                        }
                    }, this.getRetryDelay());
                });
                await resolvable;
            }
        }
    }

    public getConnectionOptions(): RedisConnection {
        return this.fullClientOptions;
    }

    public getReader(): BufReader {
        return this.reader;
    }

    public getWriter(): BufWriter {
        return this.writer;
    }

    public getConnection(): Deno.Conn {
        return this.connection;
    }

    public closeConnection(): void {
        this.closed = true;
        this.connection.close();
    }

    public getRetryAttemps(): number {
        return this.getConnectionOptions().options.retryAttempts || 3;
    }

    public getRetryDelay(): number {
        return this.getConnectionOptions().options.retryDelay || 1000;
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public isClosed(): boolean {
        return this.closed;
    }

    public getAs<T = any>(): T {
        return <any> this;
    }

    public async *receive<T = any>(): AsyncIterableIterator<T> {
        return this.getSubscriber().receive();
    }

    public getSubscriber(): RedisSubscription {
        if(this.redisSubscription === undefined) {
            this.redisSubscription = new RedisSubscription(this);
        }

        return this.redisSubscription;
    }

    public exec(command: string, ...args: (string | number)[]): Promise<RedisRawReply> {
        return RedisUtil.sendCommand(this.getWriter(), this.getReader(), command, ...args);
    }

    public getDefaultPort(): number {
        return 6379;
    }
}