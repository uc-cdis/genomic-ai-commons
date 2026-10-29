import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { describeClause, describeFilter } from "./describe";

const fixture = readFileSync(
  new URL("../__fixtures__/create_filter.json", import.meta.url),
  "utf8",
);

describe("describeClause", () => {
  it.each([
    [
      { field: "cases.project.project_id", op: "in", value: ["TCGA-CHOL"] },
      "project_id is TCGA-CHOL",
    ],
    [
      { field: "cases.demographic.gender", op: "in", value: ["female", "male"] },
      "gender is female or male",
    ],
    [
      { field: "cases.primary_site", op: "in", value: ["Lung", "Kidney", "Breast"] },
      "primary_site is Lung, Kidney or Breast",
    ],
    [
      { field: "cases.project.project_id", op: "in", value: ["A", "B", "C", "D", "E"] },
      "project_id is A, B, C or 2 more",
    ],
    [{ field: "files.data_format", op: "=", value: "BAM" }, "data_format is BAM"],
    [{ field: "cases.demographic.gender", op: "!=", value: "male" }, "gender is not male"],
    [
      { field: "cases.diagnoses.age_at_diagnosis", op: ">=", value: 14600 },
      "age_at_diagnosis ≥ 14600",
    ],
    [
      { field: "cases.diagnoses.age_at_diagnosis", op: "<", value: 21900 },
      "age_at_diagnosis < 21900",
    ],
    [{ field: "files.file_size", op: "like", value: "x*" }, "file_size like x*"],
  ])("reads %o as %s", (clause, text) => {
    expect(describeClause(clause)).toBe(text);
  });
});

describe("describeFilter", () => {
  it("reads the scope and conditions of a create_filter result", () => {
    expect(describeFilter(fixture)).toEqual({
      scope: "cases",
      conditions: ["project_id is TCGA-CHOL"],
    });
  });

  it("skips clauses it can't read, keeping the rest", () => {
    const result = JSON.stringify({
      scope: "files",
      clauses: [
        { op: "in" },
        { field: "files.experimental_strategy", op: "in", value: ["RNA-Seq"] },
      ],
    });
    expect(describeFilter(result)).toEqual({
      scope: "files",
      conditions: ["experimental_strategy is RNA-Seq"],
    });
  });

  it.each([
    ["not JSON", "Error: no such field"],
    ["no clauses", JSON.stringify({ scope: "cases" })],
  ])("gives nothing for a result that is %s", (_case, result) => {
    expect(describeFilter(result)).toBeNull();
  });
});
