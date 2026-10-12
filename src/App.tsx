import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Braces,
  Check,
  CheckCheck,
  ChevronDown,
  Code2,
  Copy,
  FileJson2,
  Github,
  Info,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";
import { example, forge, type Options } from "./forge";
const repo = "https://github.com/ahmedsamy13/TYPE-forge-";
const initial: Options = {
  rootName: "User",
  style: "interface",
  exported: true,
  optional: false,
  readonly: false,
};

export default function App() {
  const [input, setInput] = useState(example);
  const [options, setOptions] = useState(initial);
  const [status, setStatus] = useState("");
  const deferred = useDeferredValue(input);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const result = useMemo(() => {
    try {
      return { data: forge(deferred, options), error: "" };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Unable to convert this sample.",
      };
    }
  }, [deferred, options]);
  const busy = deferred !== input;
  function update<K extends keyof Options>(key: K, value: Options[K]) {
    setOptions((current) => ({ ...current, [key]: value }));
    setStatus("");
  }
  function notify(message: string) {
    setStatus(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(""), 3000);
  }
  async function copy() {
    if (!result.data || busy) return;
    try {
      await navigator.clipboard.writeText(result.data.code);
      notify("Copied to clipboard.");
    } catch {
      notify("Clipboard unavailable. Select the output and copy manually.");
    }
  }
  function download() {
    if (!result.data || busy) return;
    const url = URL.createObjectURL(
      new Blob([result.data.code], { type: "text/plain" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = options.rootName.trim() + ".ts";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("TypeScript file downloaded.");
  }
  function format() {
    try {
      setInput(JSON.stringify(JSON.parse(input), null, 2));
      notify("JSON formatted.");
    } catch {
      notify("Fix the JSON syntax before formatting.");
    }
  }
  const code = result.data?.code ?? "";
  return (
    <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-12">
      <header className="flex h-20 items-center justify-between border-b border-[#e1e6dc] sm:h-24">
        <a
          href="#"
          aria-label="SMSM Type Forge home"
          className="flex items-center gap-2.5"
        >
          <span className="grid size-9 place-items-center rounded-[10px] bg-[#2b513c] text-white">
            <Braces size={21} />
          </span>
          <span className="text-xl font-semibold tracking-[-.7px] sm:text-2xl">
            smsm <span className="font-normal">type forge</span>
            <span className="text-[#72916c]">.</span>
          </span>
        </a>
        <div className="flex items-center gap-7">
          <span className="hidden items-center gap-2 text-xs text-[#7e8a74] md:flex">
            <span className="size-1.5 rounded-full bg-[#72916c]" />
            100% local & private
          </span>
          <a
            aria-label="GitHub repository"
            href={repo}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs"
          >
            <Github size={17} />
            <span className="hidden sm:inline">GitHub</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </header>
      <main>
        <section className="relative py-9 sm:py-12 lg:py-14">
          <div className="mb-5 flex items-center gap-2 text-[9px] font-semibold tracking-[1.6px] text-[#78876e]">
            <span className="size-1.5 rounded-full bg-[#78956d]" />
            LESS TYPING. MORE BUILDING.
          </div>
          <h1 className="text-[42px] leading-[1.08] font-semibold tracking-[-2px] sm:text-[56px]">
            From JSON.
            <br />
            <span className="text-[#7e9478]">To well-typed code.</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#7d8874]">
            Turn your API responses into TypeScript interfaces and types.
            <br className="hidden sm:block" /> A little less boilerplate. A
            little more flow.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-[#718468]">
            <span className="flex items-center gap-1.5">
              <WandSparkles size={14} />
              Instant conversion
            </span>
            <span className="flex items-center gap-1.5">
              <LockKeyhole size={14} />
              Your data stays in your browser
            </span>
          </div>
          <div
            aria-hidden="true"
            className="absolute top-20 right-10 hidden size-36 -rotate-12 items-center justify-center rounded-[34px] border border-[#dde5d6] bg-[#edf2e8] text-[#749168] shadow-[10px_10px_0_#eff2eb] lg:flex"
          >
            <Braces size={63} strokeWidth={1.3} />
            <span className="absolute -top-6 -right-6 text-5xl">✳</span>
          </div>
        </section>
        <section
          aria-label="Conversion settings"
          className="mb-5 flex flex-wrap items-end gap-5 rounded-xl border border-[#dfe5d8] bg-white p-5"
        >
          <div className="min-w-0 flex-1 sm:max-w-[215px]">
            <label htmlFor="root-name" className="field-label">
              Root type name
            </label>
            <input
              id="root-name"
              spellCheck={false}
              value={options.rootName}
              onChange={(event) => update("rootName", event.target.value)}
              className="field-input"
              placeholder="ApiResponse"
              maxLength={80}
            />
          </div>
          <div>
            <span className="field-label">Declaration style</span>
            <div className="flex rounded-lg border border-[#dde4d5] bg-[#f2f5ee] p-1">
              {(["interface", "type"] as const).map((style) => (
                <button
                  key={style}
                  aria-pressed={options.style === style}
                  onClick={() => update("style", style)}
                  className={`rounded-md px-5 py-1.5 font-mono text-xs transition ${options.style === style ? "bg-white text-[#3e6238] shadow-sm" : "text-[#929c86]"}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-5 pb-2 sm:ml-auto">
            <Option
              label="Export"
              checked={options.exported}
              onChange={() => update("exported", !options.exported)}
            />
            <Option
              label="Optional"
              checked={options.optional}
              onChange={() => update("optional", !options.optional)}
            />
            <Option
              label="Readonly"
              checked={options.readonly}
              onChange={() => update("readonly", !options.readonly)}
            />
          </div>
        </section>
        <section
          aria-label="JSON to TypeScript converter"
          className="grid overflow-hidden rounded-2xl border border-[#dfe5d8] bg-white shadow-[0_8px_25px_#25352b04] lg:grid-cols-2"
        >
          <div className="min-w-0">
            <div className="editor-heading">
              <div className="flex items-center gap-2.5">
                <span className="step">01</span>
                <h2 className="text-sm font-semibold">Your JSON sample</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setInput(example);
                    setOptions(initial);
                    notify("Example loaded.");
                  }}
                  className="flex items-center gap-1.5 text-[10px] text-[#7b8e6c]"
                  title="Load example JSON"
                >
                  <RotateCcw size={12} />
                  Example
                </button>
                <button
                  onClick={() => {
                    setInput("");
                    setStatus("");
                  }}
                  aria-label="Clear JSON input"
                  title="Clear input"
                  className="text-[#95a18a]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <textarea
              aria-label="JSON input"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setStatus("");
              }}
              spellCheck={false}
              placeholder={'Paste your JSON here…\n\n{\n  "name": "Ahmed"\n}'}
              className="json-editor"
              aria-invalid={!!input.trim() && !!result.error}
              aria-describedby={result.error ? "conversion-error" : undefined}
            />
            <div className="editor-footer">
              <span className="flex items-center gap-1.5">
                <FileJson2 size={13} />
                {input.length.toLocaleString()} characters
              </span>
              <button
                onClick={format}
                disabled={!input.trim()}
                className="flex items-center gap-1.5 text-[#637b56]"
              >
                <WandSparkles size={12} />
                Format JSON
              </button>
            </div>
          </div>
          <div className="min-w-0 border-t border-[#e1e6dc] bg-[#f9fbf6] lg:border-t-0 lg:border-l">
            <div className="editor-heading">
              <div className="flex items-center gap-2.5">
                <span className="step">02</span>
                <h2 className="text-sm font-semibold">Your TypeScript</h2>
              </div>
              <span
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[9px] ${result.data && !busy ? "bg-[#edf3e6] text-[#698660]" : "bg-[#f0f1eb] text-[#929c87]"}`}
              >
                <span className="size-1 rounded-full bg-current" />
                {busy
                  ? "Converting…"
                  : result.data
                    ? "Ready to use"
                    : "Waiting for input"}
              </span>
            </div>
            <div
              className="output-editor"
              tabIndex={0}
              aria-label="TypeScript output"
              aria-busy={busy}
            >
              {code ? (
                <pre className="m-0">
                  {code
                    .trimEnd()
                    .split("\n")
                    .map((line, index) => (
                      <div className="code-line" key={index}>
                        <span className="line-number" aria-hidden="true">
                          {index + 1}
                        </span>
                        <code>{highlight(line)}</code>
                      </div>
                    ))}
                </pre>
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                  <span className="mb-4 grid size-12 place-items-center rounded-xl bg-[#edf1e6] text-[#89a178]">
                    <Code2 size={25} />
                  </span>
                  <h3 className="text-sm font-medium">
                    {input.trim()
                      ? "A little fix, then you’re ready."
                      : "Your types will appear here."}
                  </h3>
                  <p
                    id="conversion-error"
                    role={input.trim() ? "alert" : undefined}
                    className="mt-3 max-w-sm break-words text-xs leading-6 text-[#8c9580]"
                  >
                    {result.error}
                  </p>
                </div>
              )}
            </div>
            <div className="editor-footer">
              <span className="flex items-center gap-1.5">
                <Code2 size={13} />
                {result.data
                  ? `${result.data.definitions} definitions · ${result.data.properties} properties`
                  : "TypeScript"}
              </span>
              <span className="font-mono text-[10px]">.ts</span>
            </div>
          </div>
        </section>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span role="status" className="text-xs text-[#728569]">
            {status ||
              "Edit your sample or settings. Your types update automatically."}
          </span>
          <div className="flex gap-2">
            <button
              disabled={!result.data || busy}
              onClick={download}
              className="action-secondary"
            >
              <ArrowDownToLine size={15} />
              Download .ts
            </button>
            <button
              disabled={!result.data || busy}
              onClick={copy}
              className="action-primary"
            >
              {status === "Copied to clipboard." ? (
                <Check size={15} />
              ) : (
                <Copy size={15} />
              )}{" "}
              {status === "Copied to clipboard."
                ? "Copied!"
                : "Copy TypeScript"}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
        {!!result.data?.warnings.length && (
          <aside
            aria-label="Inference notes"
            className="mt-5 flex gap-3 rounded-xl border border-[#e3e7d9] bg-[#f1f4ea] p-4"
          >
            <Info size={17} className="mt-0.5 shrink-0 text-[#7b9169]" />
            <div>
              <h2 className="text-xs font-semibold">A few things to review</h2>
              <ul className="mt-2 space-y-1 text-[11px] leading-5 text-[#829071]">
                {result.data.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          </aside>
        )}
        <section className="py-9">
          <div className="flex items-center gap-2 text-[#75896a]">
            <Sparkles size={17} />
            <h2 className="text-sm font-medium">
              Less boilerplate. More possibilities.
            </h2>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <Tip
              number="01 / PASTE"
              title="Start with real data"
              description="Paste a sample API response. Nested objects and arrays are handled for you."
            />
            <Tip
              number="02 / CUSTOMIZE"
              title="Make it fit your codebase"
              description="Choose interfaces or types, name your root, and set optional or readonly properties."
            />
            <Tip
              number="03 / BUILD"
              title="Copy. Integrate. Keep building."
              description="Use the generated definitions in your app. Review them against your API’s actual contract."
            />
          </div>
          <details className="mt-6 border-t border-[#e1e6dc] pt-4 text-xs text-[#7f8d73]">
            <summary className="flex cursor-pointer items-center gap-2">
              What can a JSON sample tell me?
              <ChevronDown size={13} />
            </summary>
            <p className="mt-3 max-w-3xl leading-6">
              A sample shows the values it contains, but cannot describe every
              response your API might return. This tool merges object shapes
              across array items and marks missing fields optional. Empty arrays
              use unknown[] and null-only values stay null. Dates remain
              strings. Optional makes every property optional; Readonly also
              uses readonly arrays. TypeScript types do not validate data at
              runtime.
            </p>
            <a
              href="https://www.typescriptlang.org/docs/handbook/2/objects.html"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-[#3b613a]"
            >
              TypeScript object types
              <ArrowRight size={12} />
            </a>
          </details>
        </section>
      </main>
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e1e6dc] py-6 text-[10px] text-[#97a28c]">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-[#7d9070]">
          <Braces size={15} />
          smsm type forge.
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCheck size={13} />A little utility for your next big build.
        </span>
        <a
          aria-label="GitHub repository"
          href={repo}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5"
        >
          Open source
          <ArrowRight size={12} />
        </a>
      </footer>
    </div>
  );
}
function Option({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-[#748367]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-3.5 accent-[#537746]"
      />
      {label}
    </label>
  );
}
function Tip({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article>
      <span className="text-[9px] font-semibold tracking-[1.2px] text-[#99a58e]">
        {number}
      </span>
      <h3 className="mt-2 text-xs font-medium">{title}</h3>
      <p className="mt-2 max-w-xs text-[11px] leading-6 text-[#89957d]">
        {description}
      </p>
    </article>
  );
}
function highlight(line: string) {
  return line
    .split(
      /("(?:[^"\\]|\\.)*"|\b(?:export|interface|type|readonly|string|number|boolean|null|unknown|ReadonlyArray)\b)/g,
    )
    .map((part, index) => (
      <span
        key={index}
        className={
          part.startsWith('"')
            ? "text-[#947047]"
            : /^(export|interface|type|readonly)$/.test(part)
              ? "text-[#8c649c]"
              : /^(string|number|boolean|null|unknown|ReadonlyArray)$/.test(
                    part,
                  )
                ? "text-[#5d8969]"
                : ""
        }
      >
        {part}
      </span>
    ));
}
