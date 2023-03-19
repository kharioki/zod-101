import { expect, it } from "vitest";
import { z } from "zod";

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
