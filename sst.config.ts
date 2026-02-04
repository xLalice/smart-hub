/// <reference path="./.sst/platform/config.d.ts" />

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
    const api = new sst.aws.Function("MyApi", {
      url: {
        authorization: "none", 
        cors: true,
      },                 
      handler: "index.handler",  
    });

    return {
      api: api.url,
    };
  },
});
