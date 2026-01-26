/**
 * Utility for exponential backoff retries.
 * 
 * @param operation The async function to retry.
 * @param maxRetries Maximum number of retry attempts (default: 3).
 * @param baseDelay Base delay in ms (default: 1000).
 * @returns The result of the operation.
 */
export async function withExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let retries = 0;
    while (true) {
        try {
            return await operation();
        } catch (error: any) {
            // Only retry on network errors (fetch failures) or 5xx server errors
            // Do NOT retry on 429 (Rate Limit) as that exacerbates the problem
            // Do NOT retry on 400/401/403 (Client Errors)
            const isRetryable = !error.status || (error.status >= 500 && error.status < 600);
            
            if (!isRetryable || retries >= maxRetries) {
                throw error;
            }

            retries++;
            // Calculate delay: base * 2^retries + jitter
            const delay = baseDelay * Math.pow(2, retries) + Math.random() * 100;
            console.warn(`Request failed. Retrying in ${Math.round(delay)}ms... (Attempt ${retries}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
