import { ConnectionData, ConnectionOptions } from "../connection.ts";

export interface NatsConnectionData extends ConnectionData {
    options: {
        pedantic?: boolean;
        tls_required?: boolean;
        auth_token?: string;
        user?: string;
        pass?: string;
        name?: string;
        lang?: string;
        version?: string;
        protocol?: number;
        echo?: boolean;
        sig?: string;
        jwt?: string;
    } & ConnectionOptions
}

export interface NatsServerData {
    server_id: string;
    server_name: string;
    version: string;
    go: string;
    host: string;
    port: number;
    max_payload: number;
    proto: number;
    client_id: number;
    auth_required?: boolean;
    tls_required?: boolean;
    tls_verify?: boolean;
    connect_urls: Array<string>;
    ldm?: boolean;
    client_ip: string;
}