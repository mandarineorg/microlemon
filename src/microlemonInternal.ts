import { Client } from "./interfaces/client.ts";
import { RedisClient } from "./clients/redis/redis.ts";
import { NatsClient } from "./clients/nats/nats.ts";
import { AmqpClient } from "./clients/amqp/amqp.ts";
import { TcpClient } from "./clients/tcp/tcp.ts";

export type ClassType = { new (...params: any): any };

export class MicrolemonInternal {

    private static instance: MicrolemonInternal;

    private VALID_TRANSPORTERS: Map<string, ClassType> = new Map<string, ClassType>();

    constructor() {
        this.registerTransporter("TCP", TcpClient);
        this.registerTransporter("REDIS", RedisClient);
        this.registerTransporter("NATS", NatsClient);
        this.registerTransporter("AMQP", AmqpClient);
    }

    public registerTransporter(transporter: string, classObj: ClassType) {
        const transporterName = transporter.toUpperCase();
        if(!this.VALID_TRANSPORTERS.has(transporterName)) {
            this.VALID_TRANSPORTERS.set(transporter.toUpperCase(), classObj);
        } else {
            throw new Error("Transporter is already registered");
        }
    }

    public getTransporter(transporter: string): ClassType {
        if(this.VALID_TRANSPORTERS.has(transporter)) {
            return this.VALID_TRANSPORTERS.get(transporter)!;
        } else {
            throw new Error(`Transporter ${transporter} does not exist`);
        }
    }

    public transporterExists(transporter: string): boolean {
        return this.VALID_TRANSPORTERS.has(transporter);
    }

    public static getInstance(): MicrolemonInternal {
        if(!MicrolemonInternal.instance) {
            MicrolemonInternal.instance = new MicrolemonInternal();
        }
        return MicrolemonInternal.instance;
    }

}