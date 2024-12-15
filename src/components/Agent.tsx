import { type FC, useEffect, useState } from 'react'
import { useCompletion } from 'ai/react'
import { parseFrontmatter } from '../utils/frontmatter'

export interface AgentConfig {
  model?: {
    name: string
    temperature?: number
    maxTokens?: number
  }
  prompt?: {
    system?: string
    user?: string
  }
  capabilities?: string[]
}

export interface AgentProps {
  source: string
  onResponse?: (response: string) => void
  onError?: (error: Error) => void
}

export const Agent: FC<AgentProps> = ({ source, onResponse, onError }) => {
  const [config, setConfig] = useState<AgentConfig | null>(null)
  const { complete } = useCompletion({
    api: '/api/completion',
    onFinish: (response: string) => {
      onResponse?.(response)
    },
    onError: (error: Error) => {
      onError?.(error)
    }
  })

  useEffect(() => {
    try {
      const { frontmatter } = parseFrontmatter(source)
      setConfig(frontmatter as AgentConfig)
    } catch (error) {
      onError?.(error as Error)
    }
  }, [source, onError])

  useEffect(() => {
    const handleCompletion = async () => {
      if (!config?.prompt?.user) return

      try {
        const response = await complete(config.prompt.user, {
          body: {
            model: config.model?.name || 'gpt-4',
            temperature: config.model?.temperature || 0.7,
            max_tokens: config.model?.maxTokens,
            messages: [
              ...(config.prompt.system ? [{ role: 'system' as const, content: config.prompt.system }] : []),
              { role: 'user' as const, content: config.prompt.user }
            ]
          }
        })
        if (response) {
          onResponse?.(response)
        }
      } catch (error) {
        onError?.(error as Error)
      }
    }

    if (config?.prompt) {
      handleCompletion()
    }
  }, [config, complete, onError])

  return null
}
