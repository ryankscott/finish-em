import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bot,
  Check,
  KeyRound,
  LoaderCircle,
  SendHorizontal,
  Settings2,
  Trash2,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { api } from '@/lib/api-client'
import { cn } from '@/lib/utils'

import type { AssistantAction } from '@/server/types'

const DEFAULT_LMSTUDIO_BASE_URL = 'http://localhost:1234/v1'
const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1'
const DEFAULT_GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const DEFAULT_MODEL_BY_PROVIDER = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o-mini',
  lmstudio: 'gpt-4o-mini',
} as const

function getDefaultBaseUrl(provider: 'gemini' | 'openai' | 'lmstudio') {
  if (provider === 'lmstudio') {
    return DEFAULT_LMSTUDIO_BASE_URL
  }
  if (provider === 'openai') {
    return DEFAULT_OPENAI_BASE_URL
  }
  return DEFAULT_GEMINI_BASE_URL
}

function getProviderLabel(provider: 'gemini' | 'openai' | 'lmstudio') {
  if (provider === 'lmstudio') {
    return 'LM Studio'
  }
  if (provider === 'openai') {
    return 'OpenAI'
  }
  return 'Gemini'
}

const STATUS_BADGE_CLASSES: Record<AssistantAction['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  executed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-zinc-200 text-zinc-700',
  failed: 'bg-red-100 text-red-700',
}

function ActionCard(props: {
  action: AssistantAction
  loading: boolean
  onDecision: (decision: 'confirm' | 'cancel') => void
}) {
  const { action } = props

  return (
    <div className="mt-2 rounded-md border border-zinc-200 bg-white p-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-zinc-900">{action.label}</p>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase',
            STATUS_BADGE_CLASSES[action.status],
          )}
        >
          {action.status}
        </span>
      </div>
      {action.resultMessage && (
        <p className="mt-1 text-zinc-600">{action.resultMessage}</p>
      )}
      {action.status === 'pending' && (
        <div className="mt-2 flex gap-2">
          <Button
            type="button"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={props.loading}
            onClick={() => props.onDecision('confirm')}
          >
            <Check className="mr-1 size-3" />
            Confirm
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            disabled={props.loading}
            onClick={() => props.onDecision('cancel')}
          >
            <X className="mr-1 size-3" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}

export function AssistantPanel(props: { surface: 'ui' | 'tui'; className?: string }) {
  const queryClient = useQueryClient()
  const isClient = typeof window !== 'undefined'
  const [draft, setDraft] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsProvider, setSettingsProvider] = useState<'gemini' | 'openai' | 'lmstudio'>('gemini')
  const [settingsBaseUrl, setSettingsBaseUrl] = useState(getDefaultBaseUrl('gemini'))
  const [settingsModel, setSettingsModel] = useState<string>(DEFAULT_MODEL_BY_PROVIDER.gemini)
  const [settingsApiKey, setSettingsApiKey] = useState('')
  const messagesScrollRef = useRef<HTMLDivElement | null>(null)

  const assistantStateQuery = useQuery({
    queryKey: ['assistant', props.surface],
    queryFn: () => api.getAssistantState(props.surface),
    enabled: isClient,
  })

  const messages = assistantStateQuery.data?.messages ?? []
  const settings = assistantStateQuery.data?.settings

  useEffect(() => {
    if (!messagesScrollRef.current) {
      return
    }
    messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight
  }, [messages.length])

  useEffect(() => {
    if (!settingsOpen || !settings) {
      return
    }
    const provider = settings.aiProvider ?? 'gemini'
    setSettingsProvider(provider)
    setSettingsBaseUrl(settings.aiBaseUrl ?? getDefaultBaseUrl(provider))
    setSettingsModel(settings.aiModel ?? DEFAULT_MODEL_BY_PROVIDER[provider])
    setSettingsApiKey('')
  }, [settingsOpen, settings])

  const sendMutation = useMutation({
    mutationFn: (message: string) =>
      api.sendAssistantChat({
        surface: props.surface,
        message,
      }),
    onSuccess: () => {
      setDraft('')
      queryClient.invalidateQueries({ queryKey: ['assistant', props.surface] })
    },
  })

  const actionMutation = useMutation({
    mutationFn: (input: {
      messageId: number
      actionId: string
      decision: 'confirm' | 'cancel'
    }) =>
      api.decideAssistantAction({
        surface: props.surface,
        messageId: input.messageId,
        actionId: input.actionId,
        decision: input.decision,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant', props.surface] })
    },
  })

  const clearMutation = useMutation({
    mutationFn: () => api.clearAssistantMessages(props.surface),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant', props.surface] })
    },
  })

  const updateSettingsMutation = useMutation({
    mutationFn: (input: {
      aiProvider: 'gemini' | 'openai' | 'lmstudio'
      aiBaseUrl: string | null
      aiModel: string | null
      aiApiKey?: string | null
      clearAiApiKey?: boolean
    }) => api.updateSettings(input),
    onSuccess: () => {
      setSettingsApiKey('')
      setSettingsOpen(false)
      queryClient.invalidateQueries({ queryKey: ['assistant', props.surface] })
    },
  })

  const isBusy =
    sendMutation.isPending ||
    actionMutation.isPending ||
    clearMutation.isPending ||
    updateSettingsMutation.isPending

  const connectionLabel = useMemo(() => {
    if (!settings) {
      return 'Loading assistant settings...'
    }
    const provider = settings.aiProvider ?? 'gemini'
    const providerLabel = getProviderLabel(provider)
    const defaultBaseUrl = getDefaultBaseUrl(provider)
    const baseUrl = settings.aiBaseUrl ?? defaultBaseUrl
    const model = settings.aiModel ?? DEFAULT_MODEL_BY_PROVIDER[provider]
    const keyState =
      provider === 'lmstudio'
        ? 'not required'
        : settings.hasAiApiKey
          ? settings.aiApiKeyMasked ?? 'saved'
          : 'required'
    return `${providerLabel} · ${baseUrl} · ${model} · ${keyState}`
  }, [settings])

  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-full flex-col rounded-lg border border-zinc-200 bg-zinc-50',
        props.className,
      )}
    >
      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-zinc-700" />
          <h3 className="text-sm font-semibold text-zinc-900">Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setSettingsOpen(true)}
            aria-label="Assistant settings"
          >
            <Settings2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => clearMutation.mutate()}
            disabled={isBusy || messages.length === 0}
            aria-label="Clear assistant messages"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="border-b border-zinc-200 px-3 py-2 text-[11px] text-zinc-600">
        {connectionLabel}
      </div>

      <div
        ref={messagesScrollRef}
        className="flex-1 space-y-2 overflow-y-auto px-3 py-3"
      >
        {assistantStateQuery.isLoading && (
          <p className="text-xs text-zinc-500">Loading assistant messages...</p>
        )}
        {!assistantStateQuery.isLoading && messages.length === 0 && (
          <p className="text-xs text-zinc-500">
            Ask about completed tasks, weekly counts, or request help planning work.
          </p>
        )}
        {messages.map((message) => {
          const isUser = message.role === 'user'
          return (
            <div
              key={message.id}
              className={cn(
                'max-w-[90%] rounded-md px-3 py-2 text-sm',
                isUser
                  ? 'ml-auto bg-zinc-900 text-zinc-50'
                  : 'mr-auto border border-zinc-200 bg-white text-zinc-900',
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {!isUser &&
                message.actions.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    loading={actionMutation.isPending}
                    onDecision={(decision) =>
                      actionMutation.mutate({
                        messageId: message.id,
                        actionId: action.id,
                        decision,
                      })
                    }
                  />
                ))}
            </div>
          )
        })}
        {sendMutation.isPending && (
          <div className="mr-auto flex max-w-[90%] items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500">
            <LoaderCircle className="size-3 animate-spin" />
            <span>Thinking…</span>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 p-3">
        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about tasks or request help planning..."
            className="min-h-20 resize-none bg-white text-sm"
          />
          <Button
            type="button"
            className="w-full"
            disabled={isBusy || draft.trim().length === 0}
            onClick={() => sendMutation.mutate(draft.trim())}
          >
            {sendMutation.isPending ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <SendHorizontal className="mr-2 size-4" />
            )}
            Send
          </Button>
        </div>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assistant settings</DialogTitle>
            <DialogDescription>
              Choose a provider and configure the model.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="assistant-provider">Provider</Label>
              <Select
                id="assistant-provider"
                value={settingsProvider}
                onChange={(e) => {
                  const p = e.target.value as 'gemini' | 'openai' | 'lmstudio'
                  setSettingsProvider(p)
                  setSettingsBaseUrl(getDefaultBaseUrl(p))
                  setSettingsModel(DEFAULT_MODEL_BY_PROVIDER[p])
                }}
              >
                <option value="gemini">Gemini</option>
                <option value="lmstudio">LM Studio (local)</option>
                <option value="openai">OpenAI</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="assistant-base-url">Base URL</Label>
              <Input
                id="assistant-base-url"
                value={settingsBaseUrl}
                onChange={(event) => setSettingsBaseUrl(event.target.value)}
                placeholder={getDefaultBaseUrl(settingsProvider)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="assistant-model">Model</Label>
              <Input
                id="assistant-model"
                value={settingsModel}
                onChange={(event) => setSettingsModel(event.target.value)}
                placeholder={DEFAULT_MODEL_BY_PROVIDER[settingsProvider]}
              />
            </div>
            {(settingsProvider === 'openai' || settingsProvider === 'gemini') && (
              <div className="space-y-1">
                <Label htmlFor="assistant-api-key">API key</Label>
                <Input
                  id="assistant-api-key"
                  type="password"
                  value={settingsApiKey}
                  onChange={(event) => setSettingsApiKey(event.target.value)}
                  placeholder="Leave empty to keep existing key"
                />
                {settings?.hasAiApiKey && (
                  <p className="text-xs text-zinc-600">Saved key: {settings.aiApiKeyMasked}</p>
                )}
                {!settings?.hasAiApiKey && (
                  <p className="text-xs text-zinc-500">
                    API key is required for {settingsProvider === 'gemini' ? 'Gemini' : 'OpenAI'}.
                  </p>
                )}
              </div>
            )}
            {settingsProvider === 'lmstudio' && (
              <p className="text-xs text-zinc-500">
                LM Studio runs locally — no API key required. Start the server in the LM
                Studio app under Local Server.
              </p>
            )}
          </div>
          <DialogFooter>
            {(settingsProvider === 'openai' || settingsProvider === 'gemini') && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  updateSettingsMutation.mutate({
                    aiProvider: settingsProvider,
                    aiBaseUrl: settingsBaseUrl.trim() || null,
                    aiModel: settingsModel.trim() || null,
                    clearAiApiKey: true,
                  })
                }
                disabled={!settings?.hasAiApiKey || updateSettingsMutation.isPending}
              >
                <KeyRound className="mr-2 size-4" />
                Clear key
              </Button>
            )}
            <Button
              type="button"
              onClick={() =>
                updateSettingsMutation.mutate({
                  aiProvider: settingsProvider,
                  aiBaseUrl: settingsBaseUrl.trim() || null,
                  aiModel: settingsModel.trim() || null,
                  aiApiKey:
                    (settingsProvider === 'openai' || settingsProvider === 'gemini') && settingsApiKey.trim().length > 0
                      ? settingsApiKey.trim()
                      : undefined,
                })
              }
              disabled={updateSettingsMutation.isPending}
            >
              Save settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
