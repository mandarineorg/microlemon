import { ConnectionData, ConnectionOptions } from "../connection.ts";

export interface RedisConnection extends ConnectionData {
    options: {
        username?: string;
        password?: string;
    } & ConnectionOptions
}