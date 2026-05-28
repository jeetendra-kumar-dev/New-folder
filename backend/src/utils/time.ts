import { AppError } from "./app-error";

const units = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
} as const;

export function durationToMs(value: string) {
  const match = /^(\d+)([smhd])$/.exec(value.trim());

  if (!match) {
    throw new AppError(`Invalid duration value: ${value}`, 500, "INVALID_DURATION");
  }

  const amount = Number(match[1]);
  const unit = match[2] as keyof typeof units;

  return amount * units[unit];
}
