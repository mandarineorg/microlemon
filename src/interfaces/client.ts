import type { ConnectionData } from "./connection.ts";
import type { BufReader, BufWriter } from "../deps.ts";

export interface Client {
    connect(options: ConnectionData): Promise<Client>;
    authenticate(data: { [prop: string]: any }): Promise<any>;
    reconnect(): Promise<void>;
    getGeneralOptions(): ConnectionData;
    getFullClientOptions(): any;
    getReader(): BufReader;
    getWriter(): BufWriter;
    getConnection(): Deno.Conn;
    closeConnection(): void;
    getRetryAttemps(): number;
    getRetryDelay(): number;
    isConnected(): boolean;
    isClosed(): boolean;
    getAs<T = any>(): T;
}