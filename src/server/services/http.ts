export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export function badRequest(message: string, details?: unknown) {
  return json({ error: message, details: details ?? null }, 400)
}

export function notFound(message = 'Not found') {
  return json({ error: message }, 404)
}

export function asNumber(value: string, field = 'id') {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${field}`)
  }
  return parsed
}

export async function parseJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T
}
