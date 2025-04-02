import { type FC, useEffect, useState } from 'react'
import AgentsClient from 'agents.do'
import { parseFrontmatter, type AgentFrontmatter } from '../utils/frontmatter'

export interface AgentConfig {
  name: string
  instructions?: string
  model?: {
    provider?: 'openai' | 'anthropic'
    name: string
    temperature?: number
    maxTokens?: number
  }
  prompt?: {
    system?: string
    user?: string
  }
  capabilities?: string[]
  tools?: string[]
}

export interface AgentProps {
  source: string
  onResponse?: (response: string) => void
  onError?: (error: Error) => void
}

function convertFrontmatterToConfig(frontmatter: AgentFrontmatter): AgentConfig {
  return {
    name: frontmatter.$context?.name || 'Agent',
    model: frontmatter.model ? {
      name: frontmatter.model.name,
      temperature: frontmatter.model.temperature,
      maxTokens: frontmatter.model.maxTokens,
      provider: frontmatter.model.name.includes('claude') ? 'anthropic' : 'openai'
    } : undefined,
    prompt: frontmatter.prompt ? {
      system: frontmatter.prompt.system,
      user: frontmatter.prompt.user
    } : undefined,
    capabilities: frontmatter.capabilities?.map(cap => cap.name) || [],
    tools: []
  }
}

export const Agent: FC<AgentProps> = ({ source, onResponse, onError }) => {
  const [config, setConfig] = useState<AgentConfig | null>(null)
  const [agentsClient] = useState<AgentsClient>(() => new AgentsClient())

  useEffect(() => {
    try {
      const { frontmatter } = parseFrontmatter(source)
      setConfig(convertFrontmatterToConfig(frontmatter))
    } catch (error) {
      onError?.(error as Error)
    }
  }, [source, onError])

  useEffect(() => {
    const handleCompletion = async () => {
      if (!config?.prompt?.user) return

      try {
        const modelString = config.model?.provider === 'anthropic' 
          ? `anthropic/${config.model.name}`
          : `openai/${config.model?.name || 'gpt-4'}`

        const agentResponse = await agentsClient.create({
          name: config.name,
          description: config.instructions || config.prompt?.system || 'You are a helpful assistant.',
          systemPrompt: config.prompt?.system,
          baseModel: modelString,
          tools: config.tools || [],
        })

        if (!agentResponse?.id) {
          throw new Error('Failed to create agent')
        }

        const response = await agentsClient.ask(agentResponse.id, config.prompt.user, {
          temperature: config.model?.temperature || 0.7,
          maxTokens: config.model?.maxTokens,
        })
        
        if (response?.data) {
          onResponse?.(typeof response.data === 'string' 
            ? response.data 
            : JSON.stringify(response.data))
        }

        await agentsClient.delete(agentResponse.id)
      } catch (error) {
        onError?.(error as Error)
      }
    }

    if (config?.prompt) {
      handleCompletion()
    }
  }, [config, agentsClient, onError])

  return null
}
