/**
 * Workflow creation from Markdown
 */

import { WorkflowDefinition } from './types.js';

/**
 * Extracts Mermaid diagram content from markdown
 * @param markdown The markdown content
 * @returns The Mermaid diagram content or null if not found
 */
export function extractMermaidDiagram(markdown: string): string | null {
  const mermaidRegex = /```mermaid\s+([\s\S]*?)\s+```/;
  const match = markdown.match(mermaidRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return null;
}

/**
 * Parses a Mermaid state diagram and converts it to an XState machine definition
 * @param mermaidContent The Mermaid diagram content
 * @returns An XState machine definition
 */
export function parseMermaidStateDiagram(mermaidContent: string): WorkflowDefinition {
  const machine: WorkflowDefinition = {
    name: 'workflow',
    states: {},
    initial: ''
  };
  
  const states: Record<string, any> = {};
  let initialState = '';
  
  const lines = mermaidContent.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine || trimmedLine.startsWith('%')) {
      continue;
    }
    
    const initialStateMatch = trimmedLine.match(/\[\*\]\s*-->\s*(\w+)/);
    if (initialStateMatch) {
      initialState = initialStateMatch[1];
      if (!states[initialState]) {
        states[initialState] = { on: {} };
      }
      continue;
    }
    
    const transitionMatch = trimmedLine.match(/(\w+)\s*-->\s*(\w+)(?:\s*:\s*(.+))?/);
    if (transitionMatch) {
      const [_, fromState, toState, eventName] = transitionMatch;
      
      if (!states[fromState]) {
        states[fromState] = { on: {} };
      }
      
      if (!states[toState]) {
        states[toState] = { on: {} };
      }
      
      const event = eventName ? eventName.trim() : `TO_${toState.toUpperCase()}`;
      states[fromState].on[event] = toState;
      
      continue;
    }
    
    const finalStateMatch = trimmedLine.match(/(\w+)\s*-->\s*\[\*\]/);
    if (finalStateMatch) {
      const stateName = finalStateMatch[1];
      if (!states[stateName]) {
        states[stateName] = { on: {} };
      }
      states[stateName].type = 'final';
      continue;
    }
    
    const stateDeclarationMatch = trimmedLine.match(/state\s+(?:"([^"]+)"\s+as\s+)?(\w+)/);
    if (stateDeclarationMatch) {
      const stateName = stateDeclarationMatch[2];
      if (!states[stateName]) {
        states[stateName] = { on: {} };
      }
      continue;
    }
  }
  
  machine.states = states;
  machine.initial = initialState || Object.keys(states)[0] || 'idle';
  
  return machine;
}

/**
 * Creates a workflow from a markdown string
 * @param markdown The markdown content defining the workflow
 * @returns The created workflow (XState machine)
 */
export function createWorkflowFromMarkdown(markdown: string): any {
  const mermaidContent = extractMermaidDiagram(markdown);
  
  if (!mermaidContent) {
    return {
      id: 'workflow',
      initial: 'idle',
      states: {
        idle: {
          on: {
            ORDER_RECEIVED: 'processing'
          }
        },
        processing: {
          on: {
            COMPLETED: 'completed',
            FAILED: 'failed'
          }
        },
        completed: {
          type: 'final'
        },
        failed: {
          type: 'final'
        }
      }
    };
  }
  
  if (mermaidContent.includes('stateDiagram') || mermaidContent.match(/\[\*\]\s*-->/)) {
    const machine = parseMermaidStateDiagram(mermaidContent);
    
    return {
      id: machine.name || 'workflow',
      initial: machine.initial,
      states: machine.states
    };
  }
  
  return {
    id: 'workflow',
    initial: 'idle',
    states: {
      idle: {
        on: {
          ORDER_RECEIVED: 'processing'
        }
      },
      processing: {
        on: {
          COMPLETED: 'completed',
          FAILED: 'failed'
        }
      },
      completed: {
        type: 'final'
      },
      failed: {
        type: 'final'
      }
    }
  };
}
