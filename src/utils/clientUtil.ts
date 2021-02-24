export const encoder = new TextEncoder();
export const decoder = new TextDecoder();

export class ClientUtil {

    public static getDefaultPort(transporterType: string): number {
        switch(transporterType) {
            case "TCP":
                throw new Error("Transporter TCP requires port to be assigned");
            case "REDIS":
                return 6379;
            case "AMQP":
                return 5672;
            case "NATS":
                return 4222;
            default:
                throw new Error("");
        }
    }

}