# TCP meets Mandarine

--------------------

## Basic Usage

**Subscription**

```typescript
import { Transporters, Microlemon } from "https://deno.land/x/microlemon@v2.0.0/mod.ts";

const microlemon = new Microlemon();
const tcpClient = await microlemon.connect({
    transport: Transporters.TCP,
    options: {
        host: "127.0.0.1",
        port: 9777
    }
});
```

> Microlemon TCP layer lacks functionalities since it is meant to be primitive, this means, it is meant to create a TCP connection using Deno's runtime API, leaving functionality up to the developer.

