import test from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import { forge, type Options } from "../src/forge.ts";
const options: Options = {
  rootName: "User",
  style: "interface",
  exported: true,
  optional: false,
  readonly: false,
};
const output = (sample: unknown, changes: Partial<Options> = {}) =>
  forge(JSON.stringify(sample), { ...options, ...changes });
function compile(code: string, value?: unknown) {
  const file = "generated.ts";
  const source =
    code +
    (value === undefined
      ? ""
      : `\nconst sample: User = ${JSON.stringify(value)};`);
  const host = ts.createCompilerHost({
    strict: true,
    noEmit: true,
    types: [],
    target: ts.ScriptTarget.ES2022,
  });
  const original = host.getSourceFile.bind(host);
  host.getSourceFile = (path, version, onError) =>
    path === file
      ? ts.createSourceFile(file, source, version, true)
      : original(path, version, onError);
  const program = ts.createProgram(
    [file],
    { strict: true, noEmit: true, types: [], target: ts.ScriptTarget.ES2022 },
    host,
  );
  assert.deepEqual(
    ts
      .getPreEmitDiagnostics(program)
      .map((error) => ts.flattenDiagnosticMessageText(error.messageText, "\n")),
    [],
  );
}

test("nested objects, arrays and nullable fields compile and accept the sample", () => {
  const sample = {
    name: "Ahmed",
    address: { city: "Cairo" },
    flags: [true, false],
    mixed: [1, "a", null],
  };
  const result = output(sample);
  assert.match(result.code, /mixed: \(number \| string \| null\)\[\]/);
  compile(result.code, sample);
});
test("merges all object array items and detects missing fields", () => {
  const sample = [
    { id: 1, profile: { name: "A" } },
    { id: "2", extra: true, profile: { age: 3 } },
  ];
  const result = output(sample);
  assert.match(result.code, /id: number \| string/);
  assert.match(result.code, /extra\?: boolean/);
  assert.match(result.code, /name\?: string/);
  assert.match(result.code, /age\?: number/);
  compile(result.code, sample);
});
test("primitive roots and empty arrays receive safe aliases", () => {
  for (const sample of [null, 42, true, "hello", [], {}, [[1], ["x"]]])
    compile(output(sample).code, sample);
  assert.match(output([]).code, /unknown\[\]/);
});
test("type, optional and readonly settings generate valid definitions", () => {
  const sample = { name: "A", list: [{ enabled: true }] };
  const result = output(sample, {
    style: "type",
    optional: true,
    readonly: true,
    exported: false,
  });
  assert.match(result.code, /readonly name\?: string/);
  assert.match(result.code, /ReadonlyArray<ListItem>/);
  assert.doesNotMatch(result.code, /export /);
  compile(result.code, sample);
});
test("quotes unusual properties and avoids name collisions", () => {
  const sample = JSON.parse(
    '{"a-b":{"x":1},"a b":{"y":true},"User":{"z":1},"123 field":null,"__proto__":{"ok":true}}',
  );
  const result = output(sample);
  assert.match(result.code, /interface AB2/);
  assert.match(result.code, /"123 field": null/);
  compile(result.code);
});
test("invalid JSON, names and oversized samples give clear errors", () => {
  assert.throws(() => forge("{", options), /Invalid JSON/);
  for (const rootName of ["a b", "123", "interface", "Array", ""])
    assert.throws(
      () => forge("{}", { ...options, rootName }),
      /valid TypeScript name/,
    );
  assert.throws(() => forge(" ".repeat(250001), options), /250,000/);
});
