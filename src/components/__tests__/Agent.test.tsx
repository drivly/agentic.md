import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { Agent } from '../Agent'

vi.mock('ai/react', () => ({
  useCompletion: () => ({
    complete: vi.fn().mockResolvedValue('Response to: Hello'),
    onFinish: vi.fn()
  })
}))

describe('Agent', () => {
  it('parses frontmatter and handles completion', async () => {
    const onResponse = vi.fn()
    const source = `---
$type: Agent
model:
  name: gpt-4
  temperature: 0.7
prompt:
  system: You are a helpful assistant
  user: Hello
capabilities:
  - search
  - respond
---
# Test Content`

    render(<Agent source={source} onResponse={onResponse} />)

    await waitFor(() => {
      expect(onResponse).toHaveBeenCalledWith('Response to: Hello')
    })
  })

  it('handles parsing errors', () => {
    const onError = vi.fn()
    const source = 'Invalid frontmatter'

    render(<Agent source={source} onError={onError} />)
    expect(onError).toHaveBeenCalled()
    const error = onError.mock.calls[0][0]
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Invalid frontmatter format')
  })
})
