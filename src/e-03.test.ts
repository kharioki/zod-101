import { expect, it } from "vitest";
import { z } from "zod";

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
