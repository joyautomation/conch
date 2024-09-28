import SchemaBuilder from "@pothos/core";
import { DateTimeResolver } from "graphql-scalars";

export type Builder = ReturnType<typeof getBuilder>;

export function getBuilder(info: string) {
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
