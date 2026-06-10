import { createHttpApi } from '@/shared/http-api'

export const api = createHttpApi((input, init) => fetch(input, init))
