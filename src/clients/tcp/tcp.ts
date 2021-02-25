import { Client } from "../../interfaces/client.ts";
import { BufReader, BufWriter } from "../../deps.ts";
import { ConnectionData } from "../../interfaces/connection.ts";
import { ClientUtil } from "../../utils/clientUtil.ts";


export class TcpClient implements Client {

    private connection!: Deno.Conn;
    private generalOptions!: ConnectionData;

    private reader!: BufReader;
    private writer!: BufWriter;

    private connected!: boolean;
    private closed!: boolean;
    
    public async connect(options: ConnectionData): Promise<any> {
        this.generalOptions = Object.assign({}, {
            transport: options.transport,
            options: {
                host: options.options.host,
                port: options.options.port,
                retryAttempts: options.options.retryAttempts,
                retryDelay: options.options.retryDelay
            }
        });

        this.connection = await Deno.connect({
            port: this.generalOptions.options.port || ClientUtil.getDefaultPort(this.generalOptions.transport),
            hostname: this.generalOptions.options.host
        });

        this.reader = new BufReader(this.connection);
        this.writer = new BufWriter(this.connection);

        this.connected = true;
        this.closed = false;

        return this;
    }

    authenticate(data: { [prop: string]: any; }): Promise<any> {
        throw new Error("Method not implemented.");
    }
    reconnect(...args: any[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getConnectionOptions(): ConnectionData {
        throw new Error("Method not implemented.");
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
    closeConnection(): void {
        this.connected = false;
        this.closed = true;
        this.connection.close();
    }
    getRetryAttemps(): number {
        return this.getConnectionOptions().options.retryAttempts || 3;
    }
    getRetryDelay(): number {
        return this.getConnectionOptions().options.retryDelay || 1000;
    }
    isConnected(): boolean {
        return this.connected;
    }
    isClosed(): boolean {
        return this.closed;
    }
    getSubscriber(...args: any[]) {
        throw new Error("Method not implemented.");
    }
    public async *receive(...args: any[]): AsyncIterableIterator<any> {
        throw new Error("Method not implemented."); 
    }
    getDefaultPort(): number {
        throw new Error("Method not implemented.");
    }

}