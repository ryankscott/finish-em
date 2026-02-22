export type AssistantSettingsCommand =
  | { type: 'set_provider'; value: 'gemini' | 'openai' | 'lmstudio' }
  | { type: 'set_key'; value: string }
  | { type: 'set_base'; value: string }
  | { type: 'set_model'; value: string }
  | { type: 'clear_key' }

export function parseAssistantSettingsCommand(
  input: string,
): AssistantSettingsCommand | null {
  const text = input.trim()
  if (!text.startsWith('/')) {
    return null
  }

  if (text.startsWith('/provider ')) {
    const value = text.slice('/provider '.length).trim().toLowerCase()
    if (value === 'gemini' || value === 'openai' || value === 'lmstudio') {
      return { type: 'set_provider', value }
    }
    return null
  }

  if (text.startsWith('/key ')) {
    const value = text.slice('/key '.length).trim()
    return value.length > 0 ? { type: 'set_key', value } : null
  }

  if (text.startsWith('/base ')) {
    const value = text.slice('/base '.length).trim()
    return value.length > 0 ? { type: 'set_base', value } : null
  }

  if (text.startsWith('/model ')) {
    const value = text.slice('/model '.length).trim()
    return value.length > 0 ? { type: 'set_model', value } : null
  }

  if (text === '/clear-key') {
    return { type: 'clear_key' }
  }

  return null
}
