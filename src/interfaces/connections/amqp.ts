import { ConnectionData, ConnectionOptions } from "../connection.ts";

export interface AmqpConnectionData extends ConnectionData {
    options: {
        username?: string;
        password?: string;
        heartbeatInterval?: string;
        loglevel?: string;
        vhost?: string;
        frameMax?: string;
    } & ConnectionOptions
}