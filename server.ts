import { createYoga } from "graphql-yoga";
import { validateHost, validatePort } from "./validation.ts";
import type { Args } from "@std/cli";
import { Log, setLogLevel } from "@joyautomation/coral";
import { getBuilder } from "./graphql.ts";

export function createRunServer(
  env_prefix: string,
  default_port: number,
  default_host: string,
  appendSchema: (
    builder: ReturnType<typeof getBuilder>,
  ) => ReturnType<typeof getBuilder>,
  log: Log,
): (name: string, info: string, args: Args) => void {
  return (name: string, info: string, args: Args) => {
    setLogLevel(
      log,
      args["log-level"] || Deno.env.get(`${env_prefix}_LOG_LEVEL`) || "info",
    );
    const builder = getBuilder(info);
    appendSchema(builder);
    const schema = builder.toSchema();
    const yoga = createYoga({
      schema,
    });
    Deno.serve(
      {
        port: validatePort(
          env_prefix,
          Deno.env.get(`${env_prefix}_PORT`),
          default_port,
          log,
        ),
        hostname: validateHost(
          env_prefix,
          Deno.env.get(`${env_prefix}_HOST`),
          default_host,
          log,
        ),
        onListen({ hostname, port }) {
          log.info(`${name} graphQL api is running on ${hostname}:${port}`);
        },
      },
      yoga.fetch,
    );
  };
}
