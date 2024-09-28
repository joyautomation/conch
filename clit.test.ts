import { describe, it } from "@std/testing/bdd";
import {
  assertSpyCallArgs,
  assertSpyCalls,
  spy,
  stub,
} from "@std/testing/mock";
import { main } from "./cli.ts";
import { _internal } from "./cli.ts";
import { assert } from "@std/assert";

describe("cli", () => {
  it("should print version", () => {
    const version = JSON.parse(Deno.readTextFileSync("./deno.json")).version;
    using logStub = stub(console, "log");
    using denoExitStub = stub(Deno, "exit");
    using _argsStub = stub(
      _internal,
      "parseArguments",
      () => ({ _: [], version: true }),
    );
    main("conch", async () => {}, {}, "CONCH");
    assertSpyCalls(logStub, 1);
    assertSpyCallArgs(logStub, 0, [`conch v${version}`]);
    assertSpyCalls(denoExitStub, 1);
  });
  it("should print help", () => {
    using denoExitStub = stub(Deno, "exit");
    using _argsStub = stub(
      _internal,
      "parseArguments",
      () => ({ _: [], help: true }),
    );
    using logStub = stub(console, "log");
    main("conch", async () => {}, {}, "CONCH");
    assertSpyCalls(logStub, 1);
    assertSpyCalls(denoExitStub, 1);
  });
  it("should print help with correct format", () => {
    using denoExitStub = stub(Deno, "exit");
    using _argsStub = stub(
      _internal,
      "parseArguments",
      () => ({ _: [], help: true }),
    );
    const logSpy = stub(console, "log");

    main("conch", async () => {}, {}, "CONCH");

    assertSpyCalls(logSpy, 1);
    assertSpyCalls(denoExitStub, 1);

    const helpOutput = logSpy.calls[0].args[0];

    // Check if the help output contains expected sections
    const expectedSections = [
      "Usage:",
      "Optional Flags:",
      "--help",
      "--version",
    ];

    for (const section of expectedSections) {
      assert(
        helpOutput.includes(section),
        `Help output should include "${section}"`,
      );
    }

    // Check if the help output format is correct (e.g., options are properly aligned)
    const lines = helpOutput.split("\n");
    const optionLines = lines.filter((line: string) =>
      line.trim().startsWith("--")
    );

    for (const line of optionLines) {
      assert(
        line.match(/^\s{2}--\w+\s{2,}/),
        `Option line should be properly formatted: "${line}"`,
      );
    }
  });
});
