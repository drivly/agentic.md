/**
 * Workflow composition utilities
 */

/**
 * Composes multiple workflows into a single workflow
 * @param workflows Object containing workflows to compose
 * @returns The composed workflow
 */
export function composeWorkflows(workflows: Record<string, any>): any {
  
  return {
    id: 'composedWorkflow',
    type: 'parallel',
    states: Object.entries(workflows).reduce((acc, [key, workflow]) => {
      acc[key] = workflow;
      return acc;
    }, {} as Record<string, any>)
  };
}
