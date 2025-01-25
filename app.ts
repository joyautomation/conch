import { createRunServer } from "./server.ts";
import { type ArgDictionaryItem, createMain } from "./cli.ts";
import type { Log } from "@joyautomation/coral";
import type { Args } from "@std/cli";
import type { getBuilder } from "./graphql.ts";

/**
 * Creates a GraphQL application by combining server and CLI functionality.
 * @template Context - The type of the context object used in the GraphQL schema
 * @param {string} name - The name of the application
 * @param {string} info - Description or information about the application
 * @param {string} env_prefix - Prefix for environment variables
 * @param {{ [key: string]: ArgDictionaryItem }} argDictionary - Dictionary of CLI argument definitions
 * @param {boolean} addSubscriptions - Whether to enable GraphQL subscriptions
 * @param {boolean} addMutations - Whether to enable GraphQL mutations
 * @param {number} default_port - Default port number for the GraphQL server
 * @param {string} default_host - Default hostname for the GraphQL server
 * @param {Log} log - Logger instance
 * @param {Function} [appendSchema] - Optional function to extend the GraphQL schema
 * @param {Function} [beforeServe] - Optional function to run before starting the server
 * @param {Context} [context={}] - Optional context object for GraphQL resolvers
 * @returns {() => void} A function that starts the application when called
 */
export const createApp = <Context extends object>(
  name: string,
  info: string,
  env_prefix: string,
  argDictionary: { [key: string]: ArgDictionaryItem },
  addSubscriptions: boolean,
  addMutations: boolean,
  default_port: number,
  default_host: string,
  log: Log,
  appendSchema?: (
    builder: ReturnType<typeof getBuilder<Context>>,
    args: Args
  ) =>
    | ReturnType<typeof getBuilder<Context>>
    | Promise<ReturnType<typeof getBuilder<Context>>>,
  beforeServe?: (args: Args) => void | Promise<void>,
  context: Context = {} as Context
): ReturnType<typeof createMain<Context>> => {
  const runServer = createRunServer(
    env_prefix,
    default_port,
    default_host,
    log,
    appendSchema,
    beforeServe
  );
  return createMain(
    name,
    info,
    env_prefix,
    argDictionary,
    runServer,
    addMutations,
    addSubscriptions,
    context
  );
};
