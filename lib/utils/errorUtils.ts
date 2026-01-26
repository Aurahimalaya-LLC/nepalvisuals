export type UserFriendlyError = {
  title: string;
  message: string;
  suggestion?: string;
  code?: string;
};

export const mapTourLoadError = (error: unknown): UserFriendlyError => {
  const err = error as any;
  const rawMessage: string = err?.message || String(err) || 'Unknown error';
  const lower = rawMessage.toLowerCase();

  if (lower.includes('not found')) {
    return {
      title: 'Tour Not Found',
      message: 'The tour you are trying to view does not exist or has been removed.',
      suggestion: 'Return to the tours list and select a different tour.',
      code: 'TOUR_NOT_FOUND',
    };
  }

  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('err_aborted')) {
    const isDev = import.meta.env.DEV;
    const suggestion = isDev 
      ? 'Check your internet connection, CORS settings, or disable ad-blockers.'
      : 'Check your internet connection and try again.';

    return {
      title: 'Network Connection Issue',
      message: 'Unable to connect to the server. The request was blocked or failed.',
      suggestion,
      code: 'NETWORK_ERROR',
    };
  }

  if (lower.includes('supabase') || lower.includes('database')) {
    return {
      title: 'Service Unavailable',
      message: 'The data service is currently unavailable or returned an error.',
      suggestion: 'Please try again in a few moments.',
      code: 'SERVICE_UNAVAILABLE',
    };
  }

  return {
    title: 'Failed to Load Tour',
    message: rawMessage,
    suggestion: 'Try again or return to the tours list.',
    code: 'GENERIC_ERROR',
  };
};

