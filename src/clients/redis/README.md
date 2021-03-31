# Redis meets Mandarine

--------------------

## Basic Usage

**Subscription**

```typescript
import { Transporters, Microlemon } from "https://deno.land/x/microlemon@v2.0.0/mod.ts";

const redisClient = new Microlemon();
const redisConn = await redisClient.connect({
    transport: Transporters.REDIS,
    options: {
        host: "127.0.0.1"
    }
});

// Subscribe to multiple channels
const subscriber = await redisConn.getSubscriber().channelSubscribe("moderators", "admins");
(async function () {
  for await (const { channel, message } of subscriber.receive()) {
    console.log(`From channel ${channel}, received: ${message}`);
  }
})();
```

**Command execution**
```typescript
import { Transporters, Microlemon } from "https://deno.land/x/microlemon@v2.0.0/mod.ts";

const redisClient = new Microlemon();
const redisConn = await redisClient.connect({
    transport: Transporters.REDIS,
    options: {
        host: "127.0.0.1"
    }
});

// exec(command: string, ...args: (string | number)[])
await redisConn.exec("COMMAND", "arg1", "arg2");
```

------------

## FAQ

> **Does Microlemon REDIS support authentication by both username and password?**
>
> Yes. Microlemon supports Redis authentication with the use of an username.


