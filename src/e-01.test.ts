import { expect, it } from "vitest";
import { z } from "zod";

const numberParser = z.number();

export const toString = (num: unknown) => {
  const parsed = numberParser.parse(num);
  return String(parsed);
};

// Tests
it("should throw a runtime error when called with not a number", () => {
  expect(() => toString("123")).toThrowError(
    "Expected number, received string",
  );
});


it("should return a strung when called with a number", () => {
  expect(toString(123)).toBeTypeOf("string");
});
