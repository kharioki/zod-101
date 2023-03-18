# Zod 101 - A Typescript-first Schema Validation Library

## The Trailer

Typescript is great for checking variables at the top level, e.g.: you can specify that the `age` property for a `User` should be a number. However you can't always be sure what you're going to get from a form input. Typescript will present an error if it's not a number but on its own it doesn't know if a number is too low or too high to this usecase.

There's a similar problem with 3rd party API responses.

### Why Zod?

**Zod** allows you to work around uncertainity by checking types at the _runtime_ level as well at the type level.
Typescript checks type on the type level, Zod checks type on the runtime level.

### What is Zod?

**Zod** is a Typescript-first schema declaration and validation library. It is designed to be very developer friendly. It aims to eliminate duplicative type declarations. With Zod you can declare a validator once and Zod will automatically infer the static Typescript type for you.

____

## Runtime Checking

consider the following code:

```ts
export const toString = (num: unknown) => {
  return String(num);
};
```

We are taking in a `num` variable that we've typed as `unknown`. We then return a stringified version of it `unknown`. This means that we can call `toString()` with anything we want on the type level, including object types or undefined.

```ts
toString(1); // "1"
toString("1"); // "1"
toString({}); // "[object Object]"
toString(undefined); // "undefined"
```

For now all these would work, but we want to prevent this at the `runtime` level. If we call `toString()` with a string, we want to throw an error and say it expected a number but received a string.

**Solution** - update the function to check the type at the runtime level:

```ts
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
```

We create a `numberParser` using the `z.number()` function. This is a `ZodSchema` object that we can use to parse the `num` variable. If the `num` variable is not a number, the `parse()` function will throw an error. This means that any variable we create by calling `numberParser.parse()` will be typed as a number, and our tests will pass.
