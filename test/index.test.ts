import { describe, it, expect } from "vitest";
import { randomPolygon } from "../src";

describe("basic math", () => {
  it("adds numbers correctly", () => {
    expect(2 + 3).toBe(5);
  });

  it("subtracts numbers correctly", () => {
    expect(10 - 4).toBe(6);
  });

  it("generates a polygon", () => {
    const result = randomPolygon(10, 2);
    console.log(result);
  });
});
