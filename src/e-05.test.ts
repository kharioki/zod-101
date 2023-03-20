import { expect, it } from "vitest";
import { z } from "zod";

const Form = z.object({
  name: z.string(),
  phoneNumber: z.string().optional(),
});

export const validateFormInput = (values: unknown) => {
  const parsedValues = Form.parse(values);

  return parsedValues;
}

// Tests
it("Should validate correct inputs", async () => {
  expect(() => validateFormInput({ name: "Tony" })).not.toThrow();
  expect(() => validateFormInput({ name: "Tony", phoneNumber: "1234567890" })).not.toThrow();
});

it("Should throw an error when you do not include the name", async () => {
  expect(() => validateFormInput({})).toThrowError("Required");
});
