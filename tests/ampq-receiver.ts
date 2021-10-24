import { Microlemon } from "../src/client.ts";

const amqpClient = new Microlemon();
const connection = await amqpClient.connect({
            transport: "AMQP",
            options: {
                host: "127.0.0.1",
                username: "root",
                password: "password",
                heartbeatInterval: undefined,
                loglevel: "none",
                vhost: "/",
                frameMax: undefined
            }
});
        
for await (const data of connection.receive("myqueue")) {
    console.log(data);
}