// ============================================================================
// Copilot chat — type definitions
// ============================================================================

export type ApprovalPreview = {
  title: string;
  description: string;
  /** Key/value rows shown in the preview body */
  details?: { label: string; value: string; mono?: boolean }[];
  /** Free-form body (e.g., a drafted letter) — rendered as a code-styled block */
  body?: string;
  /** Visual tone */
  tone?: "default" | "danger" | "success";
  /** Estimated impact line (e.g., "+$1,213 added to RO") */
  impact?: string;
};

export type ResultRow = {
  label: string;
  value: string;
  /** Optional sub-detail under the value (e.g., "+$104 vs LW") */
  sub?: string;
  /** Optional severity */
  tone?: "default" | "success" | "warning" | "danger";
};

export type ResultCard = {
  title: string;
  rows: ResultRow[];
  footer?: string;
};

export type ToolCall = {
  tool: string;
  args: Record<string, unknown>;
  result: string;
  /** Milliseconds to "run" — used by the visual animation */
  durationMs?: number;
};

export type ReasoningBlock = {
  intro?: string;
  steps: string[];
};

// ============================================================================
// Message parts — what an assistant message can contain
// ============================================================================

export type MessagePart =
  | { kind: "text"; id: string; text: string; streaming?: boolean }
  | { kind: "reasoning"; id: string; intro?: string; steps: string[]; currentStep: number }
  | {
      kind: "tool";
      id: string;
      tool: string;
      args: Record<string, unknown>;
      result?: string;
      status: "running" | "done";
    }
  | {
      kind: "approval";
      id: string;
      preview: ApprovalPreview;
      status: "pending" | "approved" | "rejected";
    }
  | { kind: "result"; id: string; card: ResultCard }
  | { kind: "suggestions"; id: string; prompts: string[] };

export type Message = {
  id: string;
  role: "user" | "assistant";
  parts: MessagePart[];
  timestamp: number;
};

// ============================================================================
// Scenario step — a single action to execute over the course of a scenario
// ============================================================================

export type ScenarioStep =
  | { type: "text"; text: string; streamMs?: number }
  | { type: "reasoning"; intro?: string; steps: string[]; stepMs?: number }
  | { type: "tool"; tool: string; args: Record<string, unknown>; result: string; durationMs?: number }
  | {
      type: "approval";
      preview: ApprovalPreview;
      /** Steps to run if user approves */
      onApproved: ScenarioStep[];
      /** Steps to run if user rejects (optional) */
      onRejected?: ScenarioStep[];
    }
  | { type: "result"; card: ResultCard }
  | { type: "suggestions"; prompts: string[] }
  | { type: "pause"; ms: number };

export type Scenario = {
  /** Free-text name for debugging */
  name: string;
  /** Returns true if user input matches this scenario */
  match: (input: string) => boolean;
  /** The steps to execute */
  steps: ScenarioStep[];
  /** Optional context entity to display in the right panel */
  context?: ContextEntity;
};

// ============================================================================
// Context panel — what's shown on the right while a scenario is running
// ============================================================================

export type ContextEntity = {
  type: "ro" | "customer" | "vehicle" | "estimate" | "inspection";
  id: string;
  label: string;
  sub?: string;
  fields?: { label: string; value: string }[];
};
