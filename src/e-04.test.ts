import { expect, it } from "vitest";
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

// Tests
it("log the name", async () => {
  const data = {
    results: [
      {
        name: "Luke Skywalker",
        height: "172",
        mass: "77",
        hair_color: "blond",
      },
    ]
  };


  logStarWarsPeople(data);

  expect(data.results[0].name).toEqual("Luke Skywalker");
});
