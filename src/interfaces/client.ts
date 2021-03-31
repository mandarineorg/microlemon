import type { ConnectionData } from "./connection.ts";
import type { BufReader, BufWriter } from "../deps.ts";

export interface Client {
    connect<T = Client>(options: ConnectionData): Promise<T>;
    authenticate(data: { [prop: string]: any }): Promise<any>;
    reconnect(...args: Array<any>): Promise<void>;
    getConnectionOptions(): ConnectionData;
    getReader(): BufReader;
    getWriter(): BufWriter;
    getConnection(): Deno.Conn;
    closeConnection(): void;
    getRetryAttemps(): number;
    getRetryDelay(): number;
    isConnected(): boolean;
    isClosed(): boolean;
    getSubscriber(...args: Array<any>): any;
    receive<T = any>(...args: Array<any>): AsyncIterableIterator<T>;
    getDefaultPort(): number;
}