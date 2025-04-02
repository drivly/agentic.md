/**
 * Type declarations for the Cloudflare Agents SDK
 */

declare module 'agents' {
  import { AsyncLocalStorage } from 'node:async_hooks';

  /**
   * Decorator that marks a method as callable by clients
   */
  export function unstable_callable(
    metadata?: {
      description?: string;
      streaming?: boolean;
    }
  ): <This, Args extends unknown[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext
  ) => (this: This, ...args: Args) => Return;

  /**
   * Base class for creating Agent implementations
   */
  export class Agent<Env = unknown, State = unknown> {
    /**
     * Initial state for the Agent
     * Override to provide default state values
     */
    initialState: State;

    /**
     * Current state of the Agent
     */
    get state(): State;

    /**
     * Update the Agent's state
     * @param state New state to set
     */
    setState(state: State): void;

    /**
     * Called when the Agent's state is updated
     * @param state Updated state
     * @param source Source of the state update
     */
    onStateUpdate(state: State | undefined, source: any): void;

    /**
     * Schedule a task to be executed in the future
     */
    schedule<T = string>(
      when: Date | string | number,
      callback: keyof this,
      payload?: T
    ): Promise<any>;

    /**
     * Get a scheduled task by ID
     */
    getSchedule<T = string>(id: string): Promise<any | undefined>;

    /**
     * Cancel a scheduled task
     */
    cancelSchedule(id: string): Promise<boolean>;

    /**
     * Destroy the Agent, removing all state and scheduled tasks
     */
    destroy(): Promise<void>;
  }

  /**
   * Context for Agent execution
   */
  export const unstable_context: AsyncLocalStorage<{
    agent: Agent<unknown>;
    connection: any | undefined;
    request: Request | undefined;
  }>;
}
