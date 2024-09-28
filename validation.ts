import { Log } from "@joyautomation/coral";

export function isValidPort(input: number | undefined): boolean {
  return (
    input != null && Number.isInteger(input) && input >= 1 && input <= 65535
  );
}

export function isValidHost(input: string | undefined): boolean {
  return (
    input != null && /^[a-zA-Z0-9]+([-.](?![-.])[a-zA-Z0-9]+)*$/.test(input)
  );
}

export function validate<T>(
  input: T | undefined,
  defaultValue: T,
  validator: (input: T | undefined) => boolean,
  symbolName: string,
  log: Log,
): T {
  if (input != null && validator(input)) {
    return input;
  } else {
    if (input != null) {
      log.info(
        `${symbolName} with value "${input}" is not valid, using default "${defaultValue}"`,
      );
    }
    return defaultValue;
  }
}

export function makeNumberOrUndefined(
  input: string | number | undefined,
): number | undefined {
  return input == null ? undefined : Number(input);
}

export function validateHost(
  env_prefix: string,
  input: string | undefined,
  defaultHost: string,
  log: Log,
) {
  return validate(input, defaultHost, isValidHost, `${env_prefix}_HOST`, log);
}

export function validatePort(
  env_prefix: string,
  input: string | number | undefined,
  defaultPort: number,
  log: Log,
) {
  return validate(
    makeNumberOrUndefined(input),
    defaultPort,
    isValidPort,
    `${env_prefix}_PORT`,
    log,
  );
}
