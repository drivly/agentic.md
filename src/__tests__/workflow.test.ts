import { describe, it, expect } from 'vitest';
import { createWorkflowFromMarkdown, extractMermaidDiagram, parseMermaidStateDiagram } from '../workflow';

describe('Workflow Creation', () => {
  describe('extractMermaidDiagram', () => {
    it('should extract Mermaid diagram from markdown', () => {
      const markdown = `
# Test Workflow

This is a test workflow with a Mermaid diagram.

\`\`\`mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: START
    Processing --> Completed: FINISH
    Processing --> Failed: ERROR
    Completed --> [*]
    Failed --> [*]
\`\`\`

Some more text after the diagram.
      `;

      const result = extractMermaidDiagram(markdown);
      expect(result).toBeTruthy();
      expect(result).toContain('stateDiagram-v2');
      expect(result).toContain('[*] --> Idle');
    });

    it('should return null if no Mermaid diagram is found', () => {
      const markdown = `
# Test Workflow

This is a test workflow without a Mermaid diagram.

Some more text.
      `;

      const result = extractMermaidDiagram(markdown);
      expect(result).toBeNull();
    });
  });

  describe('parseMermaidStateDiagram', () => {
    it('should parse a simple state diagram', () => {
      const mermaidContent = `
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: START
    Processing --> Completed: FINISH
    Processing --> Failed: ERROR
    Completed --> [*]
    Failed --> [*]
      `;

      const result = parseMermaidStateDiagram(mermaidContent);
      
      expect(result.initial).toBe('Idle');
      expect(Object.keys(result.states)).toContain('Idle');
      expect(Object.keys(result.states)).toContain('Processing');
      expect(Object.keys(result.states)).toContain('Completed');
      expect(Object.keys(result.states)).toContain('Failed');
      
      expect(result.states.Idle.on.START).toBe('Processing');
      expect(result.states.Processing.on.FINISH).toBe('Completed');
      expect(result.states.Processing.on.ERROR).toBe('Failed');
      expect(result.states.Completed.type).toBe('final');
      expect(result.states.Failed.type).toBe('final');
    });

    it('should handle state declarations', () => {
      const mermaidContent = `
stateDiagram-v2
    state "Waiting for Input" as Idle
    state "Processing Request" as Processing
    [*] --> Idle
    Idle --> Processing: START
    Processing --> Idle: RESET
      `;

      const result = parseMermaidStateDiagram(mermaidContent);
      
      expect(result.initial).toBe('Idle');
      expect(Object.keys(result.states)).toContain('Idle');
      expect(Object.keys(result.states)).toContain('Processing');
      
      expect(result.states.Idle.on.START).toBe('Processing');
      expect(result.states.Processing.on.RESET).toBe('Idle');
    });
  });

  describe('createWorkflowFromMarkdown', () => {
    it('should create an XState machine from markdown with a state diagram', () => {
      const markdown = `
# Order Processing Workflow

\`\`\`mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: ORDER_RECEIVED
    Processing --> Completed: COMPLETED
    Processing --> Failed: FAILED
    Completed --> [*]
    Failed --> [*]
\`\`\`
      `;

      const result = createWorkflowFromMarkdown(markdown);
      
      expect(result.id).toBe('workflow');
      expect(result.initial).toBe('Idle');
      expect(Object.keys(result.states)).toContain('Idle');
      expect(Object.keys(result.states)).toContain('Processing');
      expect(Object.keys(result.states)).toContain('Completed');
      expect(Object.keys(result.states)).toContain('Failed');
      
      expect(result.states.Idle.on.ORDER_RECEIVED).toBe('Processing');
      expect(result.states.Processing.on.COMPLETED).toBe('Completed');
      expect(result.states.Processing.on.FAILED).toBe('Failed');
      expect(result.states.Completed.type).toBe('final');
      expect(result.states.Failed.type).toBe('final');
    });

    it('should return a default machine if no Mermaid diagram is found', () => {
      const markdown = `
# Order Processing Workflow

This is a workflow without a Mermaid diagram.
      `;

      const result = createWorkflowFromMarkdown(markdown);
      
      expect(result.id).toBe('workflow');
      expect(result.initial).toBe('idle');
      expect(Object.keys(result.states)).toContain('idle');
      expect(Object.keys(result.states)).toContain('processing');
      expect(Object.keys(result.states)).toContain('completed');
      expect(Object.keys(result.states)).toContain('failed');
    });
  });
});
