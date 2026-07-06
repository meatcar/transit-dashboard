import type { PluginAPI } from "@ampcode/plugin";

export default function (amp: PluginAPI) {
  const checker = amp.createAgent({
    name: "cheap-checks",
    model: "openai/gpt-5-nano",
    reasoningEffort: "none",
    tools: ["shell_command"],
    display: { label: "checks", color: "#30B566" },
    instructions: [
      "You are a cheap, minimal check-running subagent.",
      "Run exactly: .agents/run-checks",
      "Do not inspect files unless the command cannot be found.",
      "Do not summarize logs.",
      "Return exactly the single status line printed by the command and nothing else.",
    ].join(" "),
  });

  amp.registerTool({
    name: "run_checks_subagent",
    description:
      "Run all project checks using a cheap gpt-5-nano subagent. Returns one compact status line; verbose logs stay in .amp/in/checks.log.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    async execute(_input, ctx) {
      const result = await checker.run(
        [
          "Run the project check script now.",
          "Command: .agents/run-checks",
          "Return exactly one line in this format:",
          "OK deno:check log=.amp/in/checks.log",
          "or",
          "FAIL deno:check exit=<code> log=.amp/in/checks.log",
        ].join("\n"),
        { parentThreadID: ctx.thread.id, timeoutMs: 10 * 60 * 1000 },
      );

      return result.text.trim();
    },
  });
}
