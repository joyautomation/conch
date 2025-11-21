import { assertSpyCalls, stub } from "@std/testing/mock";
import { createRunServer } from "./server.ts";
import type { Args } from "@std/cli";
import { describe, it } from "@std/testing/bdd";
import { createLogger, LogLevel } from "@joyautomation/coral";

describe("server", () => {
  const info = "this is the conch common cli tools for Joy Automation";
  it("should run server", async () => {
    using _infoStub = stub(console, "info");
    const servStub = stub(Deno, "serve");
    const log = createLogger("conch", LogLevel.info);
    const runServer = createRunServer(
      "CONCH",
      4000,
      "0.0.0.0",
      log,
      (builder) => builder,
    );
    await runServer(
      "conch",
      info,
      {} as Args,
      false,
      false,
      {}
    );
    assertSpyCalls(servStub, 1);
  });
});

//someting
