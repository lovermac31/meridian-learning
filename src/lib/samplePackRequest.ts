/** Bound the form's waiting state; the API has shorter upstream deadlines. */
export async function submitSamplePack(body: Record<string, unknown>, timeoutMs = 15_000): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch('/api/sample-pack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('Sample request failed');
  } finally {
    clearTimeout(timer);
  }
}
