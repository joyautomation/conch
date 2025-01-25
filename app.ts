import { createRunServer } from "./server.ts";
import { type ArgDictionaryItem, createMain } from "./cli.ts";
import type { Log } from "@joyautomation/coral";
import type { Args } from "@std/cli";
import type { getBuilder } from "./graphql.ts";

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
) => {
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
