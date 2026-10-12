export interface Options {
  rootName: string;
  style: "interface" | "type";
  exported: boolean;
  optional: boolean;
  readonly: boolean;
}
export interface Result {
  code: string;
  warnings: string[];
  definitions: number;
  properties: number;
}
const forbidden = new Set(
  "any unknown never void string number boolean bigint symbol object null undefined true false interface type class enum export default import extends implements const let var function new return if else switch case break continue for while do try catch finally throw this super typeof keyof infer in instanceof as is asserts declare namespace module public private protected static readonly abstract async await yield delete with debugger package eval arguments Array ReadonlyArray Record Promise Date Object String Number Boolean Function".split(
    " ",
  ),
);
const validName = /^[A-Za-z_$][\w$]*$/;
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export function forge(text: string, options: Options): Result {
  if (text.length > 250_000)
    throw new Error(
      "Keep your sample below 250,000 characters for a responsive editor.",
    );
  if (!text.trim()) throw new Error("Paste a JSON sample to get started.");
  const root = options.rootName.trim();
  if (!validName.test(root) || forbidden.has(root))
    throw new Error(
      "Use a valid TypeScript name, such as User or ApiResponse. Avoid keywords and built-in type names.",
    );
  let sample: unknown;
  try {
    sample = JSON.parse(text);
  } catch (error) {
    throw new Error(
      `Invalid JSON. ${error instanceof Error ? error.message : "Check commas, quotes and brackets."}`,
    );
  }
  const names = new Set([root]);
  const declarations: string[] = [];
  const warnings = new Set<string>();
  let properties = 0;
  let visited = 0;
  const prefix = options.exported ? "export " : "";
  function allocate(hint: string): string {
    let stem =
      hint
        .replace(/[^\w$]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join("") || "Value";
    if (!/^[A-Za-z_$]/.test(stem) || forbidden.has(stem))
      stem = "Sample" + stem;
    let candidate = stem;
    let counter = 2;
    while (names.has(candidate)) candidate = stem + counter++;
    names.add(candidate);
    return candidate;
  }
  function infer(
    values: unknown[],
    hint: string,
    depth: number,
    fixedName?: string,
  ): string {
    visited += values.length;
    if (depth > 40 || visited > 25_000)
      throw new Error(
        "This sample is too complex. Use a smaller sample with fewer nested levels.",
      );
    if (!values.length) {
      warnings.add(
        "Empty arrays use unknown[] because their item type cannot be inferred.",
      );
      return "unknown";
    }
    const types: string[] = [];
    const add = (value: string) => {
      if (!types.includes(value)) types.push(value);
    };
    for (const value of values) {
      if (value === null) {
        add("null");
        warnings.add(
          "Null values are preserved as null; add more samples to infer their other possible types.",
        );
      } else if (typeof value !== "object") add(typeof value);
    }
    const objects = values.filter(object);
    if (objects.length) {
      const name = fixedName ?? allocate(hint);
      const keys = [...new Set(objects.flatMap((value) => Object.keys(value)))];
      const lines = keys.map((key) => {
        properties++;
        const present = objects.filter((value) =>
          Object.prototype.hasOwnProperty.call(value, key),
        );
        const type = infer(
          present.map((value) => value[key]),
          key,
          depth + 1,
        );
        const missing = present.length < objects.length;
        if (missing)
          warnings.add(
            "Fields missing from some array items are marked optional.",
          );
        const property = validName.test(key) ? key : JSON.stringify(key);
        return `  ${options.readonly ? "readonly " : ""}${property}${options.optional || missing ? "?" : ""}: ${type};`;
      });
      if (!keys.length) {
        lines.push("  [key: string]: unknown;");
        warnings.add(
          "Empty objects use an unknown index signature; their fields cannot be inferred.",
        );
      }
      declarations.push(
        options.style === "interface"
          ? `${prefix}interface ${name} {\n${lines.join("\n")}\n}`
          : `${prefix}type ${name} = {\n${lines.join("\n")}\n};`,
      );
      add(name);
    }
    const arrays = values.filter(Array.isArray) as unknown[][];
    if (arrays.length) {
      const item = infer(arrays.flat(), hint + "Item", depth + 1);
      add(
        options.readonly
          ? `ReadonlyArray<${item}>`
          : `${item.includes(" | ") ? "(" + item + ")" : item}[]`,
      );
    }
    return types.join(" | ");
  }
  const rootType = infer([sample], root, 0, object(sample) ? root : undefined);
  if (!object(sample))
    declarations.push(`${prefix}type ${root} = ${rootType};`);
  return {
    code: declarations.join("\n\n") + "\n",
    warnings: [...warnings],
    definitions: declarations.length,
    properties,
  };
}

export const example = JSON.stringify(
  {
    id: 1,
    name: "Ahmed Samy",
    email: "ahmed@example.com",
    isActive: true,
    skills: ["React", "TypeScript", "Node.js"],
    address: { city: "Cairo", country: "Egypt" },
    projects: [
      { name: "Keysmith", stars: 24 },
      { name: "Type Forge", stars: 12, url: "https://example.com" },
    ],
  },
  null,
  2,
);
