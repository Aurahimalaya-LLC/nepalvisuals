type EventPayload = Record<string, any>

export const AnalyticsService = {
  track(eventName: string, payload: EventPayload = {}) {
    try {
      // If a real analytics integration is configured, call it here.
      // For now, log safely to console to avoid leaking secrets.
      // eslint-disable-next-line no-console
      console.debug('[analytics]', eventName, payload)
      return true
    } catch {
      return false
    }
  }
}

