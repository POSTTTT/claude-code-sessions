// Shared transcript entry shape for the non-Claude agent viewers (Codex,
// Gemini, …). Each line of a session log is normalized into one of these so a
// single renderer (AgentTranscriptView) can display any of them.
export type AgentEntry = {
  kind:
    | "user"
    | "agent"
    | "reasoning"
    | "tool_call"
    | "tool_output"
    | "meta"
    | "raw";
  text?: string;
  toolName?: string;
  callId?: string;
  timestamp?: string;
  raw: unknown;
};
