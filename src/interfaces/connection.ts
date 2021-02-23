export enum Transporters {
    TCP = "TCP",
    REDIS = "REDI",
    AMQP = "AMQP",
    NATS = "NATS"
}

export interface ConnectionOptions {
    host: string;
    port?: number;
    retryAttempts?: number;
    retryDelay?: number;
}

export interface ConnectionData {
    transport: Transporters;
    options: {
        host: string;
        port?: number;
        retryAttempts?: number;
        retryDelay?: number;
    }
};
