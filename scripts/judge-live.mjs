// npm run judge:live     Runs the judge prompt (labs/judge/judge.md) on every note with a real model,
// and saves the verdicts to labs/judge/runs/live.json. Then: RECORDING=live npm test -- judge
// Needs ANTHROPIC_API_KEY (or an `ant auth login` profile). 16 short calls on Claude Haiku 5.5: well under one cent.
import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync } from "node:fs";
import { inputHash, json, read, root } from "../lib/recording.js";

const MODEL = process.env.JUDGE_MODEL ?? "claude-haiku-5-5";       // pin the judge like any dependency
const client = new Anthropic();
const system = read("labs/judge/judge.md"), notes = json("labs/judge/notes.json");

async function judge(note) {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    output_config: { effort: "low" },
    system,
    messages: [{ role: "user", content: `<note>\n${note}\n</note>` }],
  });
  if (res.stop_reason === "refusal") return { verdict: "error", why: `refused: ${res.stop_details?.category ?? "unknown"}` };
  const text = res.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();
  const verdict = /(?:^|\n)\s*\**(pass|fail)\**\s*\.?\s*$/i.exec(text)?.[1]?.toLowerCase() ?? "error";
  return { verdict, why: text.replace(/\s*\**(pass|fail)\**\s*\.?\s*$/i, "").trim(), tokens: res.usage.input_tokens + res.usage.output_tokens };
}

const out = {};
for (const [id, note] of Object.entries(notes)) {
  try { out[id] = await judge(note); }
  catch (e) {
    if (e instanceof Anthropic.AuthenticationError) { console.error("No valid API key: set ANTHROPIC_API_KEY or run ant auth login."); process.exit(1); }
    if (e instanceof Anthropic.RateLimitError) { console.error("Rate limited: wait a minute and run it again."); process.exit(1); }
    if (e instanceof Anthropic.APIError) { out[id] = { verdict: "error", why: `API error ${e.status}` }; continue; }
    throw e;
  }
  console.log(`${id.padEnd(4)} ${out[id].verdict.padEnd(5)} ${notes[id]}`);
}
writeFileSync(new URL("labs/judge/runs/live.json", root), JSON.stringify({ real: true, model: MODEL, inputHash: inputHash("judge"), recordedAt: new Date().toISOString(), ...out }, null, 1) + "\n");
console.log(`\nSaved labs/judge/runs/live.json. Compare it with the person:  RECORDING=live npm test -- judge`);
