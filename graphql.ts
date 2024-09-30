import SchemaBuilder from "@pothos/core";
import { DateTimeResolver } from "graphql-scalars";

// Add this import
import type PothosSchemaTypes from "@pothos/core";

/**
 * Type alias for the SchemaBuilder returned by getBuilder
 */
export type Builder = ReturnType<typeof getBuilder>;

/**
 * Creates and returns a SchemaBuilder instance with custom scalar types
 * @param {string} info - Information string to be used in the schema
 * @returns {PothosSchemaTypes.SchemaBuilder} A configured SchemaBuilder instance
 */
export function getBuilder(
  info: string,
  mutations: boolean,
  subscriptions: boolean,
): PothosSchemaTypes.SchemaBuilder<
  PothosSchemaTypes.ExtendDefaultTypes<{
    Scalars: {
      Date: {
        Input: Date;
        Output: Date;
      };
    };
  }>
> {
  const builder = new SchemaBuilder<{
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
 * @param {Builder} builder - The SchemaBuilder instance to initialize
 * @param {string} info - Information string to be used in the schema
 * @param {boolean} mutations - Whether to include mutation type
 * @param {boolean} subscriptions - Whether to include subscription type
 */
export function initialize(
  builder: Builder,
  info: string,
  mutations: boolean,
  subscriptions: boolean,
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
