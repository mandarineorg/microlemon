# RabbitMQ meets Mandarine
This work is based on the excellent package of [AMQP for Deno](https://github.com/lenkan/deno-amqp)

--------------------

## Basic Usage

**Subscription**
```typescript
import { AmqpClient } from "https://deno.land/x/microlemon@v1.0.0/src/clients/amqp/mod.ts";
import { Transporters } from "https://deno.land/x/microlemon@v1.0.0/mod.ts";

const amqpClient = new AmqpClient();
const amqpConnection = await amqpClient.connect({
    transport: Transporters.AMQP,
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

const channel = await amqpConnection.getAmqpConnection().openChannel();
const queueName = "my.queue";
await channel.declareQueue({ queue: queueName });
await channel.consume(
  { queue: queueName },
  async (args, props, data) => {
    console.log(JSON.stringify(args));
    console.log(JSON.stringify(props));
    console.log(new TextDecoder().decode(data));
    await channel.ack({ deliveryTag: args.deliveryTag });
  },
);
```


**Publish a message**
```typescript
import { AmqpClient } from "https://deno.land/x/microlemon@v1.0.0/src/clients/amqp/mod.ts";
import { Transporters } from "https://deno.land/x/microlemon@v1.0.0/mod.ts";

const amqpClient = new AmqpClient();
const amqpConnection = await amqpClient.connect({
    transport: Transporters.AMQP,
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

const channel = await amqpConnection.getAmqpConnection().openChannel();
const queueName = "my.queue";
await channel.declareQueue({ queue: queueName });
await channel.publish(
  { routingKey: queueName },
  { contentType: "application/json" },
  new TextEncoder().encode(JSON.stringify({ foo: "bar" })),
);

await amqpConnection.getAmqpConnection().close();
```