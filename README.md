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

____

## Verify Unknown APIs with an Object Schema

Zod is commonly used for verifying unknown APIs. Consider the following API fetch:

```ts
const PersonResult = z.unknown();

export const fetchStarWarsPersonName = async (id: string) => {
  const data = await fetch("https://swapi.dev/api/people/" + id).then((res) =>
    res.json(),
  );

  const parsedData = PersonResult.parse(data);

  return parsedData.name;
};
```

In the above instance the `PersonResult` variable is created with `z.unknown()`. This means that we are saying that we don't know what the API response will be.

The test does pass - it's the issue of `PersonResult` being typed as `unknown` that we want to solve.

**Solution** - update the `PersonResult` variable to be a `ZodObject`:

```ts
const PersonResult = z.object({
  name: z.string(),
});

export const fetchStarWarsPersonName = async (id: string) => {
  const data = await fetch("https://swapi.dev/api/people/" + id).then((res) =>
    res.json(),
  );

  const parsedData = PersonResult.parse(data);

  return parsedData.name;
};

// Tests
it("should return the name", async () => {
  expect(await fetchStarWarsPersonName("1")).toEqual("Luke Skywalker");
  expect(await fetchStarWarsPersonName("2")).toEqual("C-3PO");
});
```

Any additional keys you add to the `PersonResult` `ZodObject` from the original API response will be included in the `parsedData` variable.

____

## Create an Array of Custom Types

Consider the following API fetch:

```ts
const StarWarsPerson = z.unknown();

const StarWarsPeople = z.unknown();

export const fetchStarWarsPeople = async () => {
  const data = await fetch("https://swapi.dev/api/people/").then(response => response.json());

  const parsedData = StarWarsPeople.parse(data);

  return parsedData.results;
}
```

The correct way to solve this challenge is to create an object that references other objects. In this case `StarWarsPeople` will be a `z.object` that contains `results`.

Declaring arrays of objects like this is one of the most common use cases for `z.array()`, especially when referencing types you already created.
  
```ts
const StarWarsPerson = z.object({
  name: z.string(),
});

const StarWarsPeople = z.object({
  results: z.array(StarWarsPerson)
});

export const fetchStarWarsPeople = async () => {
  const data = await fetch("https://swapi.dev/api/people/").then(response => response.json());

  const parsedData = StarWarsPeople.parse(data);

  return parsedData.results;
}

// Tests
it("Should return the name", async () => {
  const people = await fetchStarWarsPeople();
  expect(people[0].name).toEqual("Luke Skywalker");
});
```

____

## Extracting a Type from a Parser Object

In the above example we created a `StarWarsPerson` object that we used to parse the `results` array. We can extract the type from the `StarWarsPerson` object using the `infer` keyword.

```ts
type StarWarsPersonType = z.infer<typeof StarWarsPerson>;
```

This will allow us to use the `StarWarsPersonType` type in other places in our codebase.

```ts
import { z } from "zod";

const StarWarsPerson = z.object({
  name: z.string(),
});

const StarWarsPeople = z.object({
  results: z.array(StarWarsPerson)
});

const logStarWarsPeople = (data: z.infer<typeof StarWarsPeople>) => {
  data.results.map(person => console.log(person.name));
}
```

____
