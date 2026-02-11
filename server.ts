import { createYoga } from "graphql-yoga";
import {
  makeHandler,
  GRAPHQL_TRANSPORT_WS_PROTOCOL,
} from "graphql-ws/lib/use/deno";
import { validateHost, validatePort } from "./validation.ts";
import type { Args } from "@std/cli";
import { setLogLevel, type Log } from "@joyautomation/coral";
import { getBuilder } from "./graphql.ts";
import { initContextCache } from "@pothos/core";

// Type definition for REST endpoints
export type RestEndpoint = {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
  handler: (request: Request) => Response | Promise<Response>;
};

/**
 * Logger interface used by the server
 * @public
 */
export type { Log };

/**
 * Creates a function that runs a GraphQL server.
 * @param {string} env_prefix - The prefix for environment variables.
 * @param {number} default_port - The default port number for the server.
 * @param {string} default_host - The default hostname for the server.
 * @param {Log} log - The logger instance.
 * @returns {function} A function that runs the server when called.
 */
export function createRunServer<Context extends object>(
  env_prefix: string,
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
  restEndpoints?: RestEndpoint[]
): (
  name: string,
  info: string,
  args: Args,
  mutations: boolean,
  subscriptions: boolean,
  context: Context
) => void {
  /**
   * Runs the GraphQL server.
   * @param {string} name - The name of the server.
   * @param {string} info - Information about the server.
   * @param {Args} args - Command-line arguments.
   */
  return async (
    name: string,
    info: string,
    args: Args,
    mutations: boolean,
    subscriptions: boolean,
    context: Context = {} as Context
  ) => {
    setLogLevel(
      log,
      args["log-level"] || Deno.env.get(`${env_prefix}_LOG_LEVEL`) || "info"
    );
    const builder = getBuilder<Context>(
      info,
      context,
      mutations,
      subscriptions
    );
    if (appendSchema) {
      await appendSchema(builder, args);
    }
    const schema = builder.toSchema();
    const yoga = createYoga({
      schema,
      context: () => {
        return {
          ...initContextCache(),
          ...context,
        };
      },
    });

    // Create WebSocket handler for graphql-ws subscriptions
    // Schema type assertion needed: graphql-yoga and graphql-ws resolve
    // different graphql package versions with incompatible private fields,
    // but the runtime types are structurally identical.
    const wsHandler = subscriptions
      ? makeHandler({
          schema: schema as Parameters<typeof makeHandler>[0]["schema"],
          context: () => ({
            ...initContextCache(),
            ...context,
          }),
        })
      : null;

    if (beforeServe) {
      await beforeServe(args);
    }
    Deno.serve(
      {
        port: validatePort(
          env_prefix,
          Deno.env.get(`${env_prefix}_PORT`),
          default_port,
          log
        ),
        hostname: validateHost(
          env_prefix,
          Deno.env.get(`${env_prefix}_HOST`),
          default_host,
          log
        ),
        onListen({ hostname, port }) {
          log.info(`${name} graphQL api is running on ${hostname}:${port}`);
        },
      },
      async (request: Request, connInfo: Deno.ServeHandlerInfo) => {
        // Handle WebSocket upgrades for graphql-ws subscriptions
        if (
          wsHandler &&
          request.headers.get("upgrade")?.toLowerCase() === "websocket"
        ) {
          const { socket, response } = Deno.upgradeWebSocket(request, {
            protocol: GRAPHQL_TRANSPORT_WS_PROTOCOL,
            idleTimeout: 12_000,
          });
          wsHandler(socket);
          return response;
        }

        // Handle REST endpoints if provided
        if (restEndpoints && restEndpoints.length > 0) {
          const url = new URL(request.url);
          const path = url.pathname;
          const method = request.method;

          // Find matching REST endpoint
          const endpoint = restEndpoints.find(
            (e) => e.path === path && e.method === method
          );

          if (endpoint) {
            try {
              return await endpoint.handler(request);
            } catch (error) {
              log.error(`Error in REST endpoint ${method} ${path}:`, error);
              return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }
        }

        // Default to GraphQL handler (HTTP queries/mutations + SSE subscriptions)
        return yoga.fetch(request, connInfo);
      }
    );
  };
}
