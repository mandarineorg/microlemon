import { Client } from "./interfaces/client.ts";
import { ConnectionData } from "./interfaces/connection.ts";
import { MicrolemonInternal } from "./microlemonInternal.ts";
import type { BufReader, BufWriter } from "./deps.ts";

export class Microlemon implements Client {

    private selectedClient!: Client;

    public async connect<T = Client>(options: ConnectionData): Promise<T> {
        if(this.selectedClient === undefined) {
            const transporter = options.transport;
            const microserviceClient = MicrolemonInternal.getInstance().getTransporter(transporter);
            this.selectedClient = new microserviceClient();
        }

        return this.selectedClient.connect<T>(options);
    }

    public async authenticate(data: { [prop: string]: any; }): Promise<any> {
        return this.selectedClient.authenticate(data);
    }

    public async reconnect(): Promise<void> {
        return this.selectedClient.reconnect();
    }

    public getConnectionOptions(): ConnectionData {
        return this.selectedClient.getConnectionOptions();
    }

    public getReader(): BufReader {
        return this.selectedClient.getReader();
    }

    public getWriter(): BufWriter {
        return this.selectedClient.getWriter();
    }

    public getConnection(): Deno.Conn {
        return this.selectedClient.getConnection();
    }

    public closeConnection(): void {
        return this.selectedClient.closeConnection();
    }

    public getRetryAttemps(): number {
        return this.selectedClient.getRetryAttemps();
    }

    public getRetryDelay(): number {
        return this.selectedClient.getRetryDelay();
    }

    public isConnected(): boolean {
        return this.selectedClient.isConnected();
    }

    public isClosed(): boolean {
        return this.selectedClient.isClosed();
    }

    public getSubscriber<T = any>(...args: any[]): T {
        return this.selectedClient.getSubscriber(...args);
    }

    public async *receive<T = any>(): AsyncIterableIterator<T> {
        return this.selectedClient.receive<T>();
    }

    public getDefaultPort(): number {
        return this.selectedClient.getDefaultPort();
    }

    public getSelectedClient(): any {
        return this.selectedClient;
    }

}