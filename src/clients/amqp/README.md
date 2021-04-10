# RabbitMQ meets Mandarine
This work is based on the excellent package of [AMQP for Deno](https://github.com/lenkan/deno-amqp)

--------------------

## Basic Usage

**Subscription**
```typescript
import { Transporters, Microlemon } from "https://deno.land/x/microlemon@v2.0.0/mod.ts";

const amqpClient = new Microlemon();
const amqpConnection = await amqpClient.connect({
    transport: Transporters.AMQP, // "AMQP"
    options: {
        host: "127.0.0.1",
        username: "guest",
        password: "guest",
        heartbeatInterval: undefined,
        loglevel: "none",
        vhost: "/",
        frameMax: undefined
    }
});

(async function () {
  for await (const data of amqpConnection.receive("myqueue")) {
    console.log(data);
  }
})();
```


**Publish a message**
```typescript
import { Transporters, Microlemon } from "https://deno.land/x/microlemon@v2.0.0/mod.ts";

const amqpClient = new Microlemon();
const amqpConnection = await amqpClient.connect({
    transport: Transporters.AMQP, // "AMQP"
    options: {
        host: "127.0.0.1",
        username: "guest",
        password: "guest",
        heartbeatInterval: undefined,
        loglevel: "none",
        vhost: "/",
        frameMax: undefined
    }
});

const channel = await amqpConnection.getSubscriber().openChannel();
const queueName = "my.queue";
await channel.declareQueue({ queue: queueName });
await channel.publish(
  { routingKey: queueName },
  { contentType: "application/json" },
  new TextEncoder().encode(JSON.stringify({ foo: "bar" })),
);

await amqpConnection.getSubscriber().close();
```