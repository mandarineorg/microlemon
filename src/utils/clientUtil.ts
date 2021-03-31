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
                throw new Error("Default port cannot be read because transporter is not part of the built-in clients");
        }
    }

    public static resizeTypedArray(baseArrayBuffer: Uint8Array, newByteSize: number) {
        var resizedArrayBuffer = new ArrayBuffer(newByteSize),
            len = baseArrayBuffer.byteLength,
            resizeLen = (len > newByteSize)? newByteSize : len;
    
            (new Uint8Array(resizedArrayBuffer, 0, resizeLen)).set(new Uint8Array(baseArrayBuffer, 0, resizeLen));
    
        return resizedArrayBuffer;
    }

}