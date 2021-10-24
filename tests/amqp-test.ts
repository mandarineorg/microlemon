import { Microlemon } from "../src/client.ts";

Deno.test({
    name: "Amqp",
    fn: async () => {
        
        const runReceiver = Deno.run({
            cmd: ["deno", "run", "--allow-all", "--unstable", "tests/ampq-receiver.ts"],
            stdout: "piped"
        });

        Deno.sleepSync(2500);

        const runSender = Deno.run({
            cmd: ["deno", "run", "--allow-all", "--unstable", "tests/ampq-sender.ts"],
            stdout: "piped"
        });

        Deno.sleepSync(2500);

        runReceiver.close();
        const finalReceiver = await runReceiver.output();
        const finalSender = await runSender.output();

        console.log(finalReceiver);
    }
})