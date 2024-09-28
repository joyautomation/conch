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
  initialize(builder, info);
  return builder;
}

/**
 * Initializes the GraphQL schema with query and subscription types
 * @param {Builder} builder - The SchemaBuilder instance to initialize
 * @param {string} info - Information string to be used in the schema
 */
export function initialize(
  builder: Builder,
  info: string,
) {
  builder.queryType({
    fields: (t) => ({
      info: t.string({
        resolve: () => info,
      }),
    }),
  });

  builder.subscriptionType({});
}
