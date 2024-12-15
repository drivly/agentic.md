import { describe, it, expect } from 'vitest'
import { parseFrontmatter } from '../frontmatter'

describe('parseFrontmatter', () => {
  it('parses valid frontmatter with model and prompt info', () => {
    const source = `---
$type: Agent
model:
  name: gpt-4
  temperature: 0.7
prompt:
  system: You are a helpful assistant
capabilities:
  - search
  - respond
---
# Test Content`

    const result = parseFrontmatter(source)
    expect(result.frontmatter.$type).toBe('Agent')
    expect(result.frontmatter.model?.name).toBe('gpt-4')
    expect(result.frontmatter.model?.temperature).toBe(0.7)
    expect(result.frontmatter.prompt?.system).toBe('You are a helpful assistant')
    expect(result.frontmatter.capabilities).toEqual(['search', 'respond'])
    expect(result.content).toBe('# Test Content')
  })

  it('parses complex YAML-LD with various value types and nested properties', () => {
    const source = `---
$type: Agent
$version: 1.0
$context:
  name: http://schema.org/
  version: 2.0
model:
  name: gpt-4
  temperature: 0.7
  settings:
    maxTokens: 1000
    topP: 0.9
    frequencyPenalty: 1.2
    presencePenalty: 0.8
  flags:
    stream: true
    cache: false
prompt:
  system: You are a helpful assistant
  user: Hello
  history:
    - role: user
      content: Previous message
      timestamp: 1234567890
    - role: assistant
      content: Previous response
      timestamp: 1234567891
capabilities:
  - name: search
    enabled: true
    config:
      maxResults: 5
  - name: respond
    enabled: true
metadata:
  created: 2024-01-15
  tags: [ai, agent, test]
  stats:
    requests: 0
    successful: 0
---
# Test Content`

    const result = parseFrontmatter(source)

    // Verify $ prefixed properties are on root
    expect(result.frontmatter.$type).toBe('Agent')
    expect(result.frontmatter.$version).toBe(1.0)
    expect(result.frontmatter.$context).toEqual({
      name: 'http://schema.org/',
      version: 2.0
    })

    // Verify different value types
    expect(result.frontmatter.model.temperature).toBe(0.7) // number
    expect(result.frontmatter.model.flags.stream).toBe(true) // boolean
    expect(result.frontmatter.model.flags.cache).toBe(false) // boolean
    expect(result.frontmatter.metadata.tags).toEqual(['ai', 'agent', 'test']) // array
    expect(result.frontmatter.metadata.created).toBe('2024-01-15') // date string

    // Verify nested objects and arrays
    expect(result.frontmatter.prompt.history).toHaveLength(2)
    expect(result.frontmatter.prompt.history[0]).toEqual({
      role: 'user',
      content: 'Previous message',
      timestamp: 1234567890
    })

    // Verify deeply nested numeric values
    expect(result.frontmatter.model.settings.maxTokens).toBe(1000)
    expect(result.frontmatter.model.settings.frequencyPenalty).toBe(1.2)

    // Verify complex nested objects with mixed types
    expect(result.frontmatter.capabilities[0]).toEqual({
      name: 'search',
      enabled: true,
      config: {
        maxResults: 5
      }
    })

    // Verify content is preserved
    expect(result.content).toBe('# Test Content')
  })

  it('throws error when $type is missing', () => {
    const source = `---
model:
  name: gpt-4
---
content`

    expect(() => parseFrontmatter(source)).toThrow('Missing required $type field')
  })

  it('throws error for invalid frontmatter format', () => {
    const source = 'No frontmatter here'
    expect(() => parseFrontmatter(source)).toThrow('Invalid frontmatter format')
  })
})
