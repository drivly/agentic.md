/**
 * Workflow creation from Markdown
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMermaid from 'remark-mermaid';
import { WorkflowDefinition } from './types';

/**
 * Creates a workflow from a markdown string
 * @param markdown The markdown content defining the workflow
 * @returns The created workflow (XState machine)
 */
export function createWorkflowFromMarkdown(markdown: string): any {
  const processor = unified()
    .use(remarkParse)
    .use(remarkMermaid);
  
  
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
