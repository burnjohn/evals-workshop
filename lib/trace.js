// Turns a stream-json transcript into facts. No model call.
const short = (s = "") => s.split(":").pop();            // "plugin:skill" -> "skill"

export function parseTrace(lines) {
  const ev = lines.map((l, i) => ({ i, ...JSON.parse(l) }));
  const blocks = ev.filter(e => e.type === "assistant" || e.type === "user")
    .flatMap(e => (Array.isArray(e.message.content) ? e.message.content : [])
      .map(b => ({ ...b, i: e.i, from: e.type, parent: e.parent_tool_use_id ?? null, model: e.message.model })));
  const uses = blocks.filter(b => b.from === "assistant" && b.type === "tool_use");

  const runs = uses.filter(b => ["Agent", "Task"].includes(b.name)).map(b => {
    const inside = blocks.filter(x => x.parent === b.id);
    // A background subagent's tool_result arrives at launch. Its real end is task_notification.
    const started = ev.some(e => e.subtype === "task_started" && e.tool_use_id === b.id);
    const note = ev.find(e => e.subtype === "task_notification" && e.tool_use_id === b.id);
    const result = blocks.find(x => x.from === "user" && x.type === "tool_result" && x.tool_use_id === b.id);
    return {
      role: short(b.input.subagent_type),
      taskId: b.input.description?.match(/\bT\d+\b/)?.[0] ?? null,
      prompt: b.input.prompt ?? "",
      models: [...new Set(inside.filter(x => x.from === "assistant").map(x => x.model).filter(Boolean))],
      skills: inside.filter(x => x.type === "tool_use" && x.name === "Skill").map(x => short(x.input.skill)),
      tools: inside.filter(x => x.type === "tool_use").map(x => x.name),
      start: b.i,
      end: note ? note.i : started ? Infinity : result?.i ?? Infinity,
      status: note?.status ?? (started || !result ? "unfinished" : "completed"),
    };
  });
  const results = ev.filter(e => e.type === "result");   // background work can produce several
  return {
    runs,
    of: role => runs.filter(r => r.role === role),
    task: id => runs.find(r => r.taskId === id),
    mainSkills: uses.filter(b => !b.parent && b.name === "Skill").map(b => short(b.input.skill)),
    bash: uses.filter(b => b.name === "Bash").map(b => b.input.command),
    final: results.at(-1)?.result ?? null,
    error: !results.length || results.some(r => r.is_error),
  };
}
