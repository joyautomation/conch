import SchemaBuilder from "@pothos/core";
import { DateTimeResolver } from "graphql-scalars";

// Add this import
import type PothosSchemaTypes from "@pothos/core";
export { createPubSub } from "graphql-yoga";

/**
 * Type alias for the SchemaBuilder returned by getBuilder
 */
export type Builder = ReturnType<typeof getBuilder>;

/**
 * Creates and returns a SchemaBuilder instance with custom scalar types
 * @template Context - The type of the context object
 * @param {string} info - Information string to be used in the schema
 * @param {Context} context - The context object for the schema
 * @param {boolean} mutations - Whether to enable mutations
 * @param {boolean} subscriptions - Whether to enable subscriptions
 * @returns {PothosSchemaTypes.SchemaBuilder} A configured SchemaBuilder instance
 * @public
 */
export function getBuilder<Context extends object>(
  info: string,
  _context: Context,
  mutations: boolean,
  subscriptions: boolean
): PothosSchemaTypes.SchemaBuilder<
  PothosSchemaTypes.ExtendDefaultTypes<{
    Context: Context;
    Scalars: {
      Date: {
        Input: Date;
        Output: Date;
      };
    };
  }>
> {
  const builder = new SchemaBuilder<{
    Context: Context;
    Scalars: {
      Date: {
        Input: Date;
        Output: Date;
      };
    };
  }>({});
  builder.addScalarType("Date", DateTimeResolver, {});
  initialize(builder, info, mutations, subscriptions);
  return builder;
}

/**
 * Initializes the GraphQL schema with query, mutation, and subscription types
 * @param {PothosSchemaTypes.SchemaBuilder} builder - The SchemaBuilder instance to initialize
 * @param {string} info - Information string to be used in the schema
 * @param {boolean} mutations - Whether to include mutation type
 * @param {boolean} subscriptions - Whether to include subscription type
 */
export function initialize<Context extends object>(
  builder: ReturnType<typeof getBuilder<Context>>,
  info: string,
  mutations: boolean,
  subscriptions: boolean
) {
  builder.queryType({
    fields: (t) => ({
      info: t.string({
        resolve: () => info,
      }),
    }),
  });

  if (mutations) {
    builder.mutationType({});
  }

  if (subscriptions) {
    builder.subscriptionType({});
  }
}
