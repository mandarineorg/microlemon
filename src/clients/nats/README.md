# Nats meets Mandarine

--------------------

## Basic Usage

**Subscription**
```typescript
import { NatsClient } from "https://deno.land/x/microlemon@v1.0.0/src/clients/nats/mod.ts";
import { Transporters } from "https://deno.land/x/microlemon@v1.0.0/mod.ts";

const natsClient = new NatsClient();
const natsConnection = await natsClient.connect({
    transport: Transporters.NATS,
    options: {
        host: "127.0.0.1",
    }
});

const subscriber = natsConnection.getSubscriber();
const subscribe = await subscriber.subscribe("moderators"); // Subscribe moderators 
(async function () {
  for await (const data of subscriber.receive()) {
    console.log(data);
  }
})();
```


**Publish Message**
```typescript
import { NatsClient } from "https://deno.land/x/microlemon@v1.0.0/src/clients/nats/mod.ts";
import { Transporters } from "https://deno.land/x/microlemon@v1.0.0/mod.ts";

const natsClient = new NatsClient();
const natsConnection = await natsClient.connect({
    transport: Transporters.NATS,
    options: {
        host: "127.0.0.1",
    }
});
// Publish "My Message" to channel "Moderators"
await natsConnection.getSubscriber().publish("moderators", "My message");
```


**Command execution**
```typescript
import { NatsClient } from "https://deno.land/x/microlemon@v1.0.0/src/clients/nats/mod.ts";
import { Transporters } from "https://deno.land/x/microlemon@v1.0.0/mod.ts";

const natsClient = new NatsClient();
const natsConnection = await natsClient.connect({
    transport: Transporters.NATS,
    options: {
        host: "127.0.0.1"
    }
});

// exec(execData: string)
await natsConnection.exec("PUB .....");
```

