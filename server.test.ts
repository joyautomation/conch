import { assertSpyCalls, stub } from "@std/testing/mock";
import { createRunServer } from "./server.ts";
import type { Args } from "@std/cli";
import { describe, it } from "@std/testing/bdd";
import { getLog } from "./log.ts";
import { LogLevel } from "@joyautomation/coral";
import { getBuilder } from "./graphql.ts";

describe("server", () => {
  it("should run server", () => {
    using _infoStub = stub(console, "info");
    const servStub = stub(Deno, "serve");
    const log = getLog("conch", LogLevel.info);
    const runServer = createRunServer(
      "CONCH",
      4000,
      "0.0.0.0",
      (builder) => builder,
      log,
    );
    runServer(
      "conch",
      "this is the conch common cli tools for Joy Automation",
      {} as Args,
    );
    assertSpyCalls(servStub, 1);
  });
});

//someting
