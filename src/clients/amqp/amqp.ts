import { Client } from "../../interfaces/client.ts";
import { ConnectionData } from "../../interfaces/connection.ts";
import { AmqpConnectionData } from "../../interfaces/connections/amqp.ts";
import { BufReader, BufWriter } from "../../deps.ts";
import { ClientUtil } from "../../utils/clientUtil.ts";
import { AmqpSocket } from "./amqp/amqp_socket.ts";
import { AmqpConnection } from "./amqp/amqp_connection.ts";
import { AmqpChannel } from "./amqp/amqp_channel.ts";

export class AmqpClient implements Client {

    private connection!: Deno.Conn;
    private amqpConnection!: AmqpConnection;

    private generalOptions!: ConnectionData;
    private fullClientOptions!: AmqpConnectionData;

    private reader!: BufReader;
    private writer!: BufWriter;

    private connected!: boolean;
    private closed!: boolean;

    private channel!: AmqpChannel;

    public async connect(options: AmqpConnectionData): Promise<Client> {
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
            console.log(error);
            this.closeConnection();
            throw error;
        } 
    }

    public async authenticate(data: { [prop: string]: any }): Promise<any> {
        const { username, password, heartbeatInterval, frameMax, loglevel, vhost} = data;
        const socket = new AmqpSocket(this.getConnection());

        const connection = new AmqpConnection(socket, {
            username,
            password,
            heartbeatInterval,
            frameMax,
            loglevel,
            vhost,
        });

        await connection.open();
        this.amqpConnection = connection;
    }

    reconnect(): Promise<void> {
        throw new Error("Method not implemented.");
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

    public getSubscriber(): AmqpConnection {
        return this.amqpConnection;
    }

    public async *receive<T = any>(queueName: string): AsyncIterableIterator<T> {
        if(!this.channel) {
            this.channel = await this.getSubscriber().openChannel();
            await this.channel.declareQueue({ queue: queueName });
        }

        while(this.isConnected()) {
            try {
                const resolvable= new Promise<{ args: any, props: any, data: any }>((resolve, reject) => {
                    this.channel.consume(
                        { queue: queueName },
                        async (args, props, data) => {
                            try {
                                const result = { args, props, data };
                                await this.channel.ack({ deliveryTag: args.deliveryTag });
                                resolve(result);
                            } catch(error) {
                                reject(error);
                            }
                        },
                      );
                });
                const result: { args: any, props: any, data: any }  = await resolvable;
                
                // @ts-ignore
                yield result;
            } catch {
                
            }
        }
    }

    public getDefaultPort(): number {
        return 5672;
    }
}