import { isRecord, parseJson } from "../json";

export interface FilterClause {
  field: string;
  op: string;
  value: unknown;
}

export interface FilterSummary {
  scope: string;
  conditions: string[];
}

// create_filter's ops, in words where words read better
const OP_WORDS: Record<string, string> = {
  in: "is",
  "=": "is",
  "!=": "is not",
  "<": "<",
  "<=": "≤",
  ">": ">",
  ">=": "≥",
};

const SHOWN_VALUES = 3;

// "A", "A or B", "A, B or C", "A, B, C or 2 more"
function listValues(values: unknown[]): string {
  const words = values.map(String);
  if (words.length > SHOWN_VALUES) {
    return `${words.slice(0, SHOWN_VALUES).join(", ")} or ${words.length - SHOWN_VALUES} more`;
  }
  return words.length === 1 ? words[0] : `${words.slice(0, -1).join(", ")} or ${words.at(-1)}`;
}

export function describeClause({ field, op, value }: FilterClause): string {
  // the path before the last part (cases.diagnoses.) only says where the field lives
  const name = field.split(".").at(-1) ?? field;
  return `${name} ${OP_WORDS[op] ?? op} ${listValues(Array.isArray(value) ? value : [value])}`;
}

/** What a create_filter result filters, in words. null when it isn't one. */
export function describeFilter(result: string): FilterSummary | null {
  const parsed = parseJson(result);
  if (!isRecord(parsed) || !Array.isArray(parsed.clauses)) return null;

  const conditions = parsed.clauses
    .filter(
      (clause): clause is FilterClause =>
        isRecord(clause) && typeof clause.field === "string" && typeof clause.op === "string",
    )
    .map(describeClause);
  return { scope: typeof parsed.scope === "string" ? parsed.scope : "", conditions };
}
