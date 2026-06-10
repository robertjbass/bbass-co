// Structured logger.
// - Server: emits through the pino instance Payload owns. Structured JSON
//   flows into whatever log drain is configured (Better Stack, Axiom, …).
// - Client: console with a bracketed prefix for grep-ability.
// - Prefix travels as pino's `moduleName` field on the server, so log
//   drains can filter by module.

// Structural shape of Payload's pino instance. We don't import `pino`
// directly because it's a transitive dep, not a direct one.
type PinoLogger = {
  info: (msgOrObj: unknown, msg?: string) => void
  warn: (msgOrObj: unknown, msg?: string) => void
  error: (msgOrObj: unknown, msg?: string) => void
}

const IS_DEV = process.env.NODE_ENV === 'development'
const IS_SERVER = typeof window === 'undefined'

export enum LogLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Silent = 'silent',
}

const PRIORITY: Record<LogLevel, number> = {
  [LogLevel.Info]: 0,
  [LogLevel.Warn]: 1,
  [LogLevel.Error]: 2,
  [LogLevel.Silent]: 3,
}

type LoggerOptions = {
  level?: LogLevel
}

export type Logger = {
  info: (...message: unknown[]) => void
  warn: (...message: unknown[]) => void
  error: (...message: unknown[]) => void
}

const SILENT_LOGGER: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
}

// The root pino instance is injected from lib/payload.ts once Payload
// has initialized. Before that, server-side logs fall back to console.
let rootLogger: PinoLogger | null = null

export function setServerLogger(instance: PinoLogger | null): void {
  rootLogger = instance
}

function meetsLevel(msg: LogLevel, min: LogLevel): boolean {
  return PRIORITY[msg] >= PRIORITY[min]
}

function findError(message: unknown[]): Error | undefined {
  return message.find((m): m is Error => m instanceof Error)
}

function stringify(message: unknown[]): string {
  return message
    .map((m) =>
      m instanceof Error
        ? m.message
        : typeof m === 'string'
          ? m
          : JSON.stringify(m),
    )
    .join(' ')
}

function createClientLogger(prefix: string, min: LogLevel): Logger {
  const tag = prefix ? `[${prefix}]` : ''
  const emit = (
    lvl: LogLevel,
    fn: (...a: unknown[]) => void,
    message: unknown[],
  ) => {
    if (!meetsLevel(lvl, min)) return
    if (tag) fn(tag, ...message)
    else fn(...message)
  }
  return {
    info: (...m) => emit(LogLevel.Info, console.log, m),
    warn: (...m) => emit(LogLevel.Warn, console.warn, m),
    error: (...m) => emit(LogLevel.Error, console.error, m),
  }
}

function createServerLogger(prefix: string, min: LogLevel): Logger {
  const tag = prefix ? `[${prefix}]` : ''
  const emit = (
    lvl: LogLevel,
    consoleFn: (...a: unknown[]) => void,
    message: unknown[],
  ) => {
    if (!meetsLevel(lvl, min)) return
    // Fallback to console before setServerLogger is wired (early boot).
    if (!rootLogger) {
      if (tag) consoleFn(tag, ...message)
      else consoleFn(...message)
      return
    }
    const text = tag ? `${tag} ${stringify(message)}` : stringify(message)
    const err = findError(message)
    const pinoFn =
      lvl === LogLevel.Error
        ? rootLogger.error
        : lvl === LogLevel.Warn
          ? rootLogger.warn
          : rootLogger.info
    if (err) {
      pinoFn.call(rootLogger, { err, moduleName: prefix || undefined }, text)
    } else {
      pinoFn.call(rootLogger, { moduleName: prefix || undefined }, text)
    }
  }
  return {
    info: (...m) => emit(LogLevel.Info, console.log, m),
    warn: (...m) => emit(LogLevel.Warn, console.warn, m),
    error: (...m) => emit(LogLevel.Error, console.error, m),
  }
}

/**
 * Creates a scoped logger.
 *
 * @param prefix  Module name. Appears as `[prefix]` on client and as the
 *                `moduleName` field in pino JSON on server.
 * @param options.level  Minimum emitted level. Server default: `info`.
 *                       Client default: `info` in dev, `warn` in prod.
 */
export function createLogger(prefix = '', options: LoggerOptions = {}): Logger {
  const level =
    options.level ??
    (IS_SERVER ? LogLevel.Info : IS_DEV ? LogLevel.Info : LogLevel.Warn)
  if (level === LogLevel.Silent) return SILENT_LOGGER
  return IS_SERVER
    ? createServerLogger(prefix, level)
    : createClientLogger(prefix, level)
}
