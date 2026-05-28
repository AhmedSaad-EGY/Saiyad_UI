import type { AgentDefinition } from './types/agent-definition'

/**
 * DeepSeek V4 Pro Agent
 *
 * Spawn with: @deepseek-pro <your prompt>
 *
 * Uses DeepSeek's flagship model routed through OpenRouter for the highest
 * quality code generation and analysis. Ideal for complex reasoning tasks,
 * multi-file refactoring, and nuanced architectural decisions.
 */
const definition: AgentDefinition = {
  id: 'deepseek-pro',
  displayName: 'DeepSeek V4 Pro',
  model: 'deepseek/deepseek-v4-pro',

  /**
   * Enable reasoning tokens for complex tasks (optional).
   * Uncomment to configure:
   *   reasoningOptions: { effort: 'high' },
   */

  /**
   * Provider routing — prefer DeepSeek's official endpoint on OpenRouter
   * but allow fallbacks when the primary provider is saturated.
   */
  providerOptions: {
    order: ['deepseek'],
    allow_fallbacks: true,
  },

  /**
   * Tools this agent can use directly.
   */
  toolNames: [
    'read_files',
    'write_file',
    'str_replace',
    'code_search',
    'find_files',
    'glob',
    'list_directory',
    'read_subtree',
    'run_terminal_command',
    'spawn_agents',
    'ask_user',
    'web_search',
    'read_url',
    'read_docs',
    'suggest_followups',
    'write_todos',
    'set_output',
    'end_turn',
  ],

  /**
   * Sub-agents this agent can spawn for specialized tasks.
   */
  spawnableAgents: [
    'file-picker',
    'code-searcher',
    'basher',
    'browser-use',
    'researcher-web',
    'researcher-docs',
    'code-reviewer-deepseek-flash',
    'thinker-gpt',
  ],

  /**
   * Prompt shown to the parent agent so it knows when to spawn this agent.
   */
  spawnerPrompt:
    'Use this agent for tasks that require the highest quality output — ' +
    'complex multi-file refactoring, architectural decisions, code review, ' +
    'or any scenario where DeepSeek V4 Pro\'s deeper reasoning is beneficial. ' +
    'Spawn by calling @deepseek-pro.',

  /**
   * Include the full conversation history so this agent understands context
   * from the parent conversation.
   */
  includeMessageHistory: true,

  /**
   * System prompt giving the agent its identity and instructions.
   */
  systemPrompt:
    'You are DeepSeek V4 Pro — a high-reasoning AI coding assistant routed ' +
    'through OpenRouter. You excel at deep analysis, architectural decisions, ' +
    'complex refactoring, and producing high-quality, production-ready code. ' +
    'You spawn specialized sub-agents (file-picker, code-searcher, basher, ' +
    'etc.) to gather context and validate changes, just like the base Codebuff agent.',

  /**
   * Instructions injected after every user message.
   */
  instructionsPrompt:
    '1. Always gather context first — read relevant files before making edits.\n' +
    '2. Prioritize correctness over speed; you are the pro model for a reason.\n' +
    '3. Spawn sub-agents in parallel when possible to maximize efficiency.\n' +
    '4. Validate your changes by running typechecks, lints, and tests.\n' +
    '5. Follow existing project conventions — mimic the style of surrounding code.\n' +
    '6. Keep your summaries concise — a few bullet points at most.',
}

export default definition
