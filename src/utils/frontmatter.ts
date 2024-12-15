import { parse } from 'yaml'

interface ModelSettings {
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

interface ModelFlags {
  stream?: boolean
  cache?: boolean
}

interface ModelConfig {
  name: string
  temperature?: number
  maxTokens?: number
  settings?: ModelSettings
  flags?: ModelFlags
}

interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface PromptConfig {
  system?: string
  user?: string
  history?: HistoryMessage[]
}

interface CapabilityConfig {
  name: string
  enabled: boolean
  config?: {
    maxResults?: number
  }
}

interface MetadataConfig {
  created?: string
  tags?: string[]
  stats?: {
    requests: number
    successful: number
  }
}

export interface AgentFrontmatter {
  $type: string
  $version?: number
  $context?: {
    name: string
    version: number
  }
  model?: ModelConfig
  prompt?: PromptConfig
  capabilities?: CapabilityConfig[]
  metadata?: MetadataConfig
}

export interface ParseResult {
  frontmatter: AgentFrontmatter
  content: string
}

const FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/

export function parseFrontmatter(source: string): ParseResult {
  const match = source.match(FRONTMATTER_REGEX)
  if (!match) {
    throw new Error('Invalid frontmatter format')
  }

  const [, frontmatterYaml, content] = match
  const parsedFrontmatter = parse(frontmatterYaml)

  if (!parsedFrontmatter.$type) {
    throw new Error('Missing required $type field in frontmatter')
  }

  return {
    frontmatter: parsedFrontmatter as AgentFrontmatter,
    content: content.trim()
  }
}
