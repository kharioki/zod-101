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

## Make Schemas Optional

Zod is also useful for validating user input. Consider the following form:

```ts
import { expect, it } from "vitest";
import { z } from "zod";

const Form = z.object({
  name: z.string(),
  phoneNumber: z.string(),
});

export const validateFormInput = (values: unknown) => {
  const parsedData = Form.parse(values);

  return parsedData;
};

// TESTS

it("Should validate correct inputs", async () => {
  expect(() =>
    validateFormInput({
      name: "Matt",
    }),
  ).not.toThrow();

  expect(() =>
    validateFormInput({
      name: "Matt",
      phoneNumber: "123",
    }),
  ).not.toThrow();
});

it("Should throw when you do not include the name", async () => {
  expect(() => validateFormInput({})).toThrowError("Required");
});
```

The `phoneNumber` field is optional, but we want to make sure that the `name` field is required. We can do this by adding `.optional()` to the `phoneNumber` field.

```ts
const Form = z.object({
  name: z.string(),
  phoneNumber: z.string().optional(),
});
```

____

## Set a Default Value

Consider the following form:

```ts
import { z } from "zod";

const Form = z.object({
  repoName: z.string(),
  keywords: z.array(z.string()).optional(),
});

export const validateFormInput = (values: unknown) => {
  const parsedValues = Form.parse(values);

  return parsedValues;
}
```

Suppose we want to default the `keywords` field to an empty array if the user does not provide any keywords. We can do this by adding `.default()` to the `keywords` field.

```ts
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
```

**The Input is Different than the Output**
The `validateFormInput` function returns an object that is different than the input. The `keywords` field is always an array, even if the user does not provide any keywords.

If we create a `FormInput` and `FornOutput` type, we can use the `z.infer` keyword to extract the type from the `Form` object.

```ts
type FormInput = z.infer<typeof Form>;
type FormOutput = z.infer<typeof Form>;
```

**Introducing `z.input`**
The above input is not quite correct because when we input into `validateFormInput`, we don't pass in any keywords. We can use the `z.input` keyword to extract the input type from the `Form` object.

```ts
type FormInput = z.input<typeof Form>;
type FormOutput = z.infer<typeof Form>;
```

____

## Being specific with Allowed Types

Consider the following form:

```ts
const Form = z.object({
  repoName: z.string(),
  privacyLevel: z.string(),
});
```

Suppose we want to make sure that the `privacyLevel` field is either `public` or `private`. We can do this by adding `.enum()` to the `privacyLevel` field.

```ts
const Form = z.object({
  repoName: z.string(),
  privacyLevel: z.enum(["public", "private"]),
});
```

Another way is to use the `z.union` keyword and pass in an array of `z.literal` objects. You can use `.literal()` to represent any literal value.

```ts
const Form = z.object({
  repoName: z.string(),
  privacyLevel: z.union([z.literal("public"), z.literal("private")]),
});
```

The `.enum()` keyword is arguably more readable, but the `z.union` keyword is more flexible.

____

## Complex Schema Validation

Consider the following form:

```ts
import { z } from "zod";

const Form = z.object({
  name: z.string(),
  phoneNumber: z.string().optional(),
  email: z.string(),
  website: z.string().optional(),
});

export const validateFormInput = (values: unknown) => {
  const parsedData = Form.parse(values);

  return parsedData;
};
```

Suppose we want to add a few constraints on what the values can be. We want to validate that the name is at least 1 character, the phone number to have the right amount of digits, and we want the website to be a valid URL and email to be a valid email address.

```ts
import { z } from "zod";

const Form = z.object({
  name: z.string().min(1),
  phoneNumber: z.string().min(5).max(20).optional(),
  email: z.string().email(),
  website: z.string().url().optional(),
});

export const validateFormInput = (values: unknown) => {
  const parsedData = Form.parse(values);

  return parsedData;
};
```

____

## Reducing duplicated code by composing schemas

Consider the following code:

```ts
import { z } from "zod";

const User = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

const Post = z.object({
  id: z.string().uuid(),
  title: z.string(),
  body: z.string(),
});

const Comment = z.object({
  id: z.string().uuid(),
  text: z.string(),
});
```

There are a few ways we can refactor this code.

**Simple solution**
We can strip out the `id` into its own type. Then we can use the `Id` type in the `User`, `Post`, and `Comment` types.

```ts
const Id = z.string().uuid();

const User = z.object({
  id: Id,
  name: z.string(),
});

const Post = z.object({
  id: Id,
  title: z.string(),
  body: z.string(),
});

const Comment = z.object({
  id: Id,
  text: z.string(),
});
```

**Better solution** - use the Extend method
Another solution would be to create a base object `ObjectWithId` and extend it with the `User`, `Post`, and `Comment` types.

```ts
const ObjectWithId = z.object({
  id: z.string().uuid(),
});

const User = ObjectWithId.extend({
  name: z.string(),
});

const Post = ObjectWithId.extend({
  title: z.string(),
  body: z.string(),
});

const Comment = ObjectWithId.extend({
  text: z.string(),
});
```

**Use Merge**
We can also use the `.merge` keyword to merge the `ObjectWithId` and the `User`, `Post`, and `Comment` types.

```ts
const User = ObjectWithId.merge(
  z.object({
    name: z.string(),
  }),
);
```

Merging is generally used when two different types are being combined, rather than extending a single type.

____

## Transforming Data from within a Schema

Another useful feature of Zod is manipulating data from an API response after parsing. Consider the following API response:

```ts
import { z } from "zod";

const StarWarsPerson = z.object({
  name: z.string(),
});

const StarWarsPeopleResults = z.object({
  results: z.array(StarWarsPerson),
});

export const fetchStarWarsPeople = async () => {
  const response = await fetch("https://swapi.dev/api/people/");
  const data = await response.json();

  const parsedData = StarWarsPeopleResults.parse(data);

  return parsedData;
};
```

We can use the `.transform` keyword to manipulate the data from the API response. In this case, we want to transform the `name` field and add a new field called `nameAsArray`.

```ts
import { z } from "zod";

const StarWarsPerson = z
  .object({
    name: z.string(),
  })
  .transform((person) => ({
    ...person,
    nameAsArray: person.name.split(" "),
  }));

const StarWarsPeopleResults = z.object({
  results: z.array(StarWarsPerson),
});

export const fetchStarWarsPeople = async () => {
  const data = await fetch(
    "https://www.totaltypescript.com/swapi/people.json",
  ).then((res) => res.json());

  const parsedData = StarWarsPeopleResults.parse(data);

  return parsedData.results;
};

// TESTS

it("Should resolve the name and nameAsArray", async () => {
  expect((await fetchStarWarsPeople())[0]).toEqual({
    name: "Luke Skywalker",
    nameAsArray: ["Luke", "Skywalker"],
  });
});
```
