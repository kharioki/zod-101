import { expect, it } from "vitest";
import { z } from "zod";

const Form = z.object({
  name: z.string().min(1), // We want to validate that the name is at least 1 character
  // We want to validate that the phone number is between 5 and 20 characters
  phoneNumber: z.string().min(5).max(20).optional(),
  email: z.string().email(),
  website: z.string().url().optional(),
});

export const validateFormInput = (values: unknown) => {
  const parsedData = Form.parse(values);

  return parsedData;
};

// TESTS

it("Should fail if you pass a phone number with too few characters", async () => {
  expect(() =>
    validateFormInput({
      name: "Tony",
      email: "tony@example.com",
      phoneNumber: "1",
    }),
  ).toThrowError("String must contain at least 5 character(s)");
});

it("Should fail if you pass a phone number with too many characters", async () => {
  expect(() =>
    validateFormInput({
      name: "Tony",
      email: "tony@example.com",
      phoneNumber: "1238712387612387612837612873612387162387",
    }),
  ).toThrowError("String must contain at most 20 character(s)");
});

it("Should throw when you pass an invalid email", async () => {
  expect(() =>
    validateFormInput({
      name: "Tony",
      email: "tony",
    }),
  ).toThrowError("Invalid email");
});

it("Should throw when you pass an invalid website URL", async () => {
  expect(() =>
    validateFormInput({
      name: "Tony",
      email: "tony@example.com",
      website: "/",
    }),
  ).toThrowError("Invalid url");
});

it("Should pass when you pass a valid website URL", async () => {
  expect(() =>
    validateFormInput({
      name: "Tony",
      email: "tony@example.com",
      website: "https://kharioki.com",
    }),
  ).not.toThrowError();
});