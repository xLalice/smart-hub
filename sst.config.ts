/// <reference path="./.sst/platform/config.d.ts" />

import { Secret } from "./.sst/platform/src/components";

export default $config({
  app(input) {
    return {
      name: "smart-hub",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "ap-southeast-1",
        }
      }
    };
  },
  async run() {
    const secret = new sst.Secret("DiscordWebhookUrl");

    const queue = new sst.aws.Queue("MyQueue");

    queue.subscribe({
      handler: "src/consumer.handler",
      link: [secret], 
    });

    const api = new sst.aws.Function("MyApi", {
      url: { authorization: "none", cors: true },
      handler: "src/index.handler",
      link: [queue], 
    });

    return {
      api: api.url,
      queue: queue.url,
    };
  },
});
