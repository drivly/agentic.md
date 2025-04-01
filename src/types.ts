/**
 * Type definitions for agentic.md
 */

export interface AgentDefinition {
  name: string;
  description?: string;
  properties?: Record<string, any>;
  workflow?: any; // XState machine definition
}

export interface WorkflowDefinition {
  name: string;
  description?: string;
  states: Record<string, any>;
  initial: string;
}

export interface AgentTemplate {
  name: string;
  defaultProperties: Record<string, any>;
  methods: Record<string, Function>;
  createAgent: (markdownPath: string) => any;
}
