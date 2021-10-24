import { Microlemon } from "../src/client.ts";

const amqpClient = new Microlemon();
const lol = await amqpClient.connect({
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
const channel = await lol.getSubscriber().openChannel();
const queueName = "myqueue";
await channel.declareQueue({ queue: queueName });
await channel.publish(
  { routingKey: queueName },
  { contentType: "application/json" },
  new TextEncoder().encode(JSON.stringify({ foo: "bars" })),
);
await lol.getSubscriber().close();
console.log("sent");