# Nats meets Mandarine

--------------------

## Basic Usage

**Subscription**
```typescript
import { Transporters, Microlemon } from "https://deno.land/x/microlemon@v2.0.0/mod.ts";

const natsClient = new Microlemon();
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
import { Transporters, Microlemon } from "https://deno.land/x/microlemon@v2.0.0/mod.ts";

const natsClient = new Microlemon();
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
import { Transporters, Microlemon } from "https://deno.land/x/microlemon@v2.0.0/mod.ts";

const natsClient = new Microlemon();
const natsConnection = await natsClient.connect({
    transport: Transporters.NATS,
    options: {
        host: "127.0.0.1"
    }
});

// exec(execData: string)
await natsConnection.exec("PUB .....");
```

