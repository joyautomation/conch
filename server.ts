import { createYoga } from "graphql-yoga";
import { validateHost, validatePort } from "./validation.ts";
import type { Args } from "@std/cli";
import { type Log, setLogLevel } from "@joyautomation/coral";
import { getBuilder } from "./graphql.ts";

/**
 * Creates a function that runs a GraphQL server.
 * @param {string} env_prefix - The prefix for environment variables.
 * @param {number} default_port - The default port number for the server.
 * @param {string} default_host - The default hostname for the server.
 * @param {function} appendSchema - A function to append additional schema to the GraphQL builder.
 * @param {Log} log - The logger instance.
 * @returns {function} A function that runs the server when called.
 */
export function createRunServer(
  env_prefix: string,
  default_port: number,
  default_host: string,
  log: Log,
  appendSchema?: (
    builder: ReturnType<typeof getBuilder>,
    args: Args,
  ) => ReturnType<typeof getBuilder> | Promise<ReturnType<typeof getBuilder>>,
  beforeServe?: (args: Args) => void | Promise<void>,
): (name: string, info: string, args: Args) => void {
  /**
   * Runs the GraphQL server.
   * @param {string} name - The name of the server.
   * @param {string} info - Information about the server.
   * @param {Args} args - Command-line arguments.
   */
  return async (name: string, info: string, args: Args) => {
    setLogLevel(
      log,
      args["log-level"] || Deno.env.get(`${env_prefix}_LOG_LEVEL`) || "info",
    );
    const builder = getBuilder(info);
    if (appendSchema) {
      await appendSchema(builder, args);
    }
    const schema = builder.toSchema();
    const yoga = createYoga({
      schema,
    });
    if (beforeServe) {
      await beforeServe(args);
    }
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
