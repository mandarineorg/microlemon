# Microlemon
[![Microlemon CI](https://github.com/mandarineorg/microlemon/workflows/Unit%20Tests/badge.svg)](https://github.com/mandarineorg/microlemon)

<img src="https://www.mandarinets.org/assets/images/full-logo-simple.svg" width="180" height="180" />

A collection of microservices with a common interface for [Deno](https://deno.land) by [Mandarine](https://deno.land/x/mandarinets).

------------

## Description
Microlemon is a collection of implementation of microservices for Deno. Currently, Microlemon has support for:
- [RabbitMQ](https://www.rabbitmq.com/) through AMQP
- [REDIS](https://redis.io/)
- [NATS](https://nats.io/)

## Status
Microlemon offers a common interface to manage different communication layers. By having a common interface, the code tends to be straightforward and adaptable. While Microlemon is under construction, it is considered to be stable.

--------------

## RabbitMQ
For information about how to use **RabbitMQ** with Microlemon, [click here](https://github.com/mandarineorg/microlemon/blob/main/src/clients/amqp/README.md)  

## Redis
For information about how to use **Redis** with Microlemon, [click here](https://github.com/mandarineorg/microlemon/blob/main/src/clients/redis/README.md)  

## Nats
For information about how to use **Nats** with Microlemon, [click here](https://github.com/mandarineorg/microlemon/blob/main/src/clients/nats/README.md)  

## TCP
For information about how to use **TCP** with Microlemon, [click here](https://github.com/mandarineorg/microlemon/blob/main/src/clients/tcp/README.md)  

--------------

## Adding Transporters to Internal Factory

Microlemon allows you to inject implementations of the Client interface to the internal factory. You can do this by using `MicrolemonInternal`.

```typescript
import { MicrolemonInternal, Client, Microlemon } from "https://deno.land/x/microlemon@v2.0.0/mod.ts";

class MyTransporterImpl implements Client {
    ...
}

MicrolemonInternal.getInstance().registerTransporter("MY_TRANSPORTER_KEY", MyTransporterImpl);

const microlemon = new Microlemon();
const connection = await microlemon.connect({
    transport: "MY_TRANSPORTER_KEY",
    options: {
        host: "127.0.0.1",
        port: 9777
    }
});
```
--------------


## Questions
For questions & community support, please visit our [Discord Channel](https://discord.gg/qs72byB) or join us on our [twitter](https://twitter.com/mandarinets).

## Want to help?
### Interested in coding
In order to submit improvements to the code, open a PR and wait for it to review. We appreciate you doing this.
### Not interested in coding
We would love to have you in our community, [please submit an issue](https://github.com/mandarineorg/microlemon/issues) to provide information about a bug, feature, or improvement you would like.

## Follow us wherever we are going
- Author : [Andres Pirela](https://twitter.com/andreestech)
- Website : https://www.mandarinets.org/
- Twitter : [@mandarinets](https://twitter.com/mandarinets)
- Discord : [Click here](https://discord.gg/qs72byB)