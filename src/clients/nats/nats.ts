import { Client } from "../../interfaces/client.ts";
import { NatsConnectionData, NatsServerData } from "../../interfaces/connections/nats.ts";
import { BufReader, BufWriter } from "../../deps.ts";
import { ConnectionData, ConnectionOptions } from "../../interfaces/connection.ts";
import { ClientUtil, decoder, encoder } from "../../utils/clientUtil.ts";
import { NatsUtil } from "./natsUtil.ts";
import { NATSerror } from "./errors.ts";
import { NatsSubscription } from "./natsSubscription.ts";

export class NatsClient implements Client {

    private connection!: Deno.Conn;

    private generalOptions!: ConnectionData;
    private fullClientOptions!: NatsConnectionData;

    private reader!: BufReader;
    private writer!: BufWriter;

    private connected!: boolean;
    private closed!: boolean;

    // @ts-ignore
    private natsServerData!: NatsServerData = {};

    private subscriber!: NatsSubscription;

    public async connect(options: NatsConnectionData): Promise<any> {
        // @ts-ignore
        options.options["verbose"] = true;
        
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

        try {
            await this.authenticate(options.options);
            this.connected = true;
            this.closed = false;
            return this;
        } catch (error) {
            this.closeConnection();
            throw error;
        } 
    }

    public async authenticate(data: { [prop: string]: any }): Promise<any> {
        const [response, err, isOk] = await NatsUtil.connect(this.getWriter(), this.getReader(), data);
        if(isOk) {
            this.natsServerData = JSON.parse(response);
        }
    }

    public async reconnect(): Promise<void> {
        if (!this.reader.peek(1)) {
            throw new Error("Client is closed.");
        } else {
            try {
                await NatsUtil.sendCommand(this.writer, this.reader, "PING");
                this.connected = true;
            } catch (error) {
                let retries = 0;
                const resolvable = new Promise((resolve, reject) => {
                    const reconnectionInterval = setInterval(async () => {
                        if(retries > this.getRetryAttemps()) {
                            this.closeConnection();
                            clearInterval(reconnectionInterval);
                            reject(new NATSerror("Could not re-establish connection"));
                        }

                        try {
                            this.closeConnection();
                            await this.connect(this.getConnectionOptions());
                            await NatsUtil.sendCommand(this.getWriter(), this.getReader(), "PING");
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

    getConnectionOptions() {
        return this.fullClientOptions;
    }
    getReader(): BufReader {
        return this.reader;
    }
    getWriter(): BufWriter {
        return this.writer;
    }
    getConnection(): Deno.Conn {
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

    public getNatsServerData(): NatsServerData {
        return this.natsServerData;
    }

    public exec(execData: string) {
        if(!this.isClosed() && this.isConnected()) {
            return NatsUtil.exec(this.getWriter(), this.getReader(), execData);
        } else {
            throw new NATSerror("Command could not be executed because connection is either closed or not established");
        }
    }

    public getSubscriber(): NatsSubscription {
        if(this.subscriber === undefined) {
            this.subscriber = new NatsSubscription(this)
        }
        return this.subscriber;
    }

    public async *receive<T = any>(): AsyncIterableIterator<T> {
        return this.subscriber.receive();
    }

    public getDefaultPort(): number {
        return 4222;
    }
}