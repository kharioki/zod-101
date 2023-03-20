import { expect, it } from "vitest";
import { z } from "zod";

const Form = z.object({
  repoName: z.string(),
  privacyLevel: z.enum(["private", "public"]).default("private"),
});

export const validateFormInput = (values: unknown) => {
  const parsedData = Form.parse(values);

  return parsedData;
};

// TESTS

it("Should fail if an invalid privacyLevel passed", async () => {
  expect(() =>
    validateFormInput({
      repoName: "mattpocock",
      privacyLevel: "something-not-allowed",
    }),
  ).toThrowError();
});

it("Should permit valid privacy levels", async () => {
  expect(
    validateFormInput({
      repoName: "Tony",
      privacyLevel: "private",
    }).privacyLevel,
  ).toEqual("private");

  expect(
    validateFormInput({
      repoName: "kharioki",
      privacyLevel: "public",
    }).privacyLevel,
  ).toEqual("public");
});
