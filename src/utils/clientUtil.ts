import { Transporters } from "../interfaces/connection.ts";


export const encoder = new TextEncoder();
export const decoder = new TextDecoder();

export class ClientUtil {

    public static getDefaultPort(transporterType: Transporters): number {
        switch(transporterType) {
            case Transporters.TCP:
                throw new Error("Transporter TCP requires port to be assigned");
            case Transporters.REDIS:
                return 6379;
            case Transporters.AMQP:
                return 5672;
            case Transporters.NATS:
                return 4222;
        }
    }

}