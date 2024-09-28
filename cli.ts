import { type Args, parseArgs } from "@std/cli";
import { getBuilder } from "./graphql.ts";
import { createRunServer } from "./server.ts";

/**
 * Reads the version from the deno.json file.
 * @returns {string} The version string.
 */
function getVersion(): string {
  const config = Deno.readTextFileSync("./deno.json");
  return JSON.parse(config).version;
}

/**
 * Prints the current version of the application to the console.
 * @param {string} name - The name of the application.
 */
export function printVersion(name: string): void {
  console.log(`${name} v${getVersion()}`);
}

/**
 * Pads a string to a fixed width with spaces.
 * If the string is longer than the specified width, it will be truncated.
 * @param {string} str - The input string to pad.
 * @param {number} width - The desired fixed width.
 * @param {boolean} [padRight=true] - If true, pad on the right; if false, pad on the left.
 * @returns {string} The padded string of the specified width.
 */
function padToFixedWidth(
  str: string,
  width: number,
  padRight: boolean = true,
): string {
  if (str.length >= width) {
    return str.slice(0, width);
  }
  const padding = " ".repeat(width - str.length);
  return padRight ? str + padding : padding + str;
}

/**
 * Prints the help message for the application, including usage instructions and available options.
 * @param {string} name - The name of the application.
 * @param {{ [key: string]: ArgDictionaryItem }} argDictionaryInput - The input argument dictionary.
 * @param {string} env_prefix - The environment variable prefix.
 */
export function printHelp(
  name: string,
  argDictionaryInput: { [key: string]: ArgDictionaryItem },
  env_prefix: string,
): void {
  const argDictionary = buildArgDictionary(
    name,
    argDictionaryInput,
    env_prefix,
  );
  const lines: string[] = [
    `Usage: ${name} [OPTIONS...]`,
    ``,
    `Optional Flags:`,
  ];
  Object.entries(argDictionary).forEach(([key, arg]) => {
    lines.push(
      `  -${arg.short},  --${padToFixedWidth(key, 15)}${
        padToFixedWidth(arg.env ? `${arg.env}` : ``, 26)
      }${arg.description}`,
    );
  });
  console.log(lines.join("\n"));
}

/**
 * Represents an item in the argument dictionary.
 */
export type ArgDictionaryItem = {
  short: string;
  description: string;
  type: "boolean" | "string";
  env?: string; // environment variable that sets this argument if not specified
  action?: () => void;
  exit?: boolean;
};

/**
 * Builds a dictionary of command-line arguments and their properties.
 * @param {string} name - The name of the application.
 * @param {{ [key: string]: ArgDictionaryItem }} argDictionary - The input argument dictionary.
 * @param {string} env_prefix - The environment variable prefix.
 * @returns {{ [key: string]: ArgDictionaryItem }} The complete argument dictionary.
 */
export function buildArgDictionary(
  name: string,
  argDictionary: { [key: string]: ArgDictionaryItem },
  env_prefix: string,
): { [key: string]: ArgDictionaryItem } {
  return {
    help: {
      short: "h",
      type: "boolean",
      description: "Show help",
      action: () => printHelp(name, argDictionary, env_prefix),
      exit: true,
    },
    version: {
      short: "v",
      type: "boolean",
      description: "Show version",
      action: () => printVersion(name),
      exit: true,
    },
    log_level: {
      short: "l",
      type: "string",
      description: "Set the log level",
      env: `${env_prefix}_LOG_LEVEL`,
    },
    ...argDictionary,
  };
}

/**
 * Filters and returns argument keys from the argDictionary based on the specified type.
 * @param {{ [key: string]: ArgDictionaryItem }} argDictionary - An object containing argument definitions.
 * @param {"boolean" | "string"} argType - The type of arguments to filter.
 * @returns {string[]} An array of argument keys matching the specified type.
 */
export function getArgsFromType(
  argDictionary: { [key: string]: ArgDictionaryItem },
  argType: "boolean" | "string",
): string[] {
  return Object.entries(argDictionary).filter(([key, value]) =>
    value.type === argType
  ).map(([key]) => key);
}

/**
 * Parses command-line arguments into a structured Args object.
 * @param {string[]} args - An array of command-line argument strings.
 * @param {{ [key: string]: ArgDictionaryItem }} argDictionary - An object containing argument definitions.
 * @returns {Args} An object containing parsed arguments.
 */
export function parseArguments(
  args: string[],
  argDictionary: { [key: string]: ArgDictionaryItem },
): Args {
  const booleanArgs = getArgsFromType(argDictionary, "boolean");
  const stringArgs = getArgsFromType(argDictionary, "string");
  return parseArgs(args, {
    alias: Object.fromEntries(
      Object.entries(argDictionary).map(([key, value]) => [key, value.short]),
    ),
    boolean: booleanArgs,
    string: stringArgs,
    "--": true,
  });
}

/**
 * Internal object containing references to key functions.
 */
export const _internal = {
  printHelp: printHelp,
  printVersion: printVersion,
  parseArguments: parseArguments,
};

/**
 * The main function that runs the application.
 * It parses command-line arguments, handles help and version flags,
 * and starts the server if no special flags are provided.
 * We use dynamic import to defer the server start until we have parsed the arguments.
 * This prevents the SparkplugHost from being created if we're not going to run the server yet.
 * @param {string} name - The name of the application.
 * @param {(args: Args) => Promise<void>} runServer - Function to run the server.
 * @param {{ [key: string]: ArgDictionaryItem }} argDictionaryInput - The input argument dictionary.
 * @param {string} env_prefix - The environment variable prefix.
 * @returns {Promise<void>}
 */

export function createMain(
  name: string,
  env_prefix: string,
  argDictionaryInput: { [key: string]: ArgDictionaryItem },
  builder: ReturnType<typeof getBuilder>,
  runServer: ReturnType<typeof createRunServer>,
) {
  return async (): Promise<void> => {
    const argDictionary = buildArgDictionary(
      name,
      argDictionaryInput,
      env_prefix,
    );
    const args = _internal.parseArguments(Deno.args, argDictionary);
    Object.keys(args).forEach((key) => {
      const arg = argDictionary[key];
      if (arg?.action) {
        arg.action();
      }
      if (arg?.exit) {
        Deno.exit(0);
      }
    });
    await runServer(name, builder, args);
  };
}
