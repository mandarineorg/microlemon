export enum Transporters {
    TCP = "TCP",
    AMQP = "AMQP",
    REDIS = "REDIS",
    NATS = "NATS"
}
export interface ConnectionOptions {
    host: string;
    port?: number;
    retryAttempts?: number;
    retryDelay?: number;
}

export interface ConnectionData {
    transport: string;
    options: {
        host: string;
        port?: number;
        retryAttempts?: number;
        retryDelay?: number;
        [prop: string]: any;
    }
};
