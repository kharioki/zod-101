import { expect, it, expectTypeOf } from "vitest";
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

/**
 * 🕵️‍♂️ Refactor this code below to reduce the duplication,
 * while also making sure the cases don't go red!
 */

const ObjectWithId = z.object({
  id: z.string().uuid(),
});

const NewUser = ObjectWithId.extend({
  name: z.string(),
});

const NewPost = ObjectWithId.extend({
  title: z.string(),
  body: z.string(),
});

const NewComment = ObjectWithId.extend({
  text: z.string(),
});

// TESTS
it("should equal the original User type", () => {
  expectTypeOf(User).toEqualTypeOf(NewUser);
});
