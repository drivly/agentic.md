/**
 * Agent templates
 */

import { AgentTemplate } from './types';

/**
 * Defines a reusable agent template
 * @param template The template configuration
 * @returns The agent template
 */
export function defineAgentTemplate(template: Omit<AgentTemplate, 'createAgent'>): AgentTemplate {
  return {
    ...template,
    createAgent: (markdownPath: string) => {
      return {
        ...template.defaultProperties,
        ...template.methods,
        onMessageReceived: async (message: any) => {
          console.log(`[${template.name}] Received message:`, message);
          return { status: 'processing', message: 'Agent is processing your request' };
        }
      };
    }
  };
}
