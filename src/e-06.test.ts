import { expect, it } from "vitest";
import { z } from "zod";

const Form = z.object({
  repoName: z.string(),
  keywords: z.array(z.string()).default([]),
});

export const validateFormInput = (values: unknown) => {
  const parsedValues = Form.parse(values);

  return parsedValues;
}

// Tests
it("Should include keywords if passed", async () => {
  const result = validateFormInput({ repoName: "vitest", keywords: ["test", "testing"] });

  expect(result).toEqual({ repoName: "vitest", keywords: ["test", "testing"] });
  expect(result.keywords).toEqual(["test", "testing"]);
});

it("Should not include keywords if not passed", async () => {
  const result = validateFormInput({ repoName: "vitest" });

  expect(result.keywords).toEqual([]);
});
