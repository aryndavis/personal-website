// Twilio webhook helpers: check that a request really came from Twilio, and build the reply.

const encoder = new TextEncoder()

const toBase64 = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes)))

/**
 * Twilio signs each webhook: HMAC-SHA1 of the webhook URL followed by every POST parameter
 * (sorted by name, name then value), keyed with the account's auth token, base64-encoded.
 * https://www.twilio.com/docs/usage/security#validating-requests
 */
export async function twilioSignature(authToken: string, url: string, params: Record<string, string>): Promise<string> {
  const data = url + Object.keys(params).sort().map((name) => name + params[name]).join('')
  const key = await crypto.subtle.importKey('raw', encoder.encode(authToken), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  return toBase64(await crypto.subtle.sign('HMAC', key, encoder.encode(data)))
}

/** Constant-time comparison, so the check doesn't leak how much of a forged signature was right. */
function sameText(a: string, b: string): boolean {
  const left = encoder.encode(a)
  const right = encoder.encode(b)
  let difference = left.length ^ right.length
  for (let i = 0; i < Math.max(left.length, right.length); i++) difference |= (left[i] ?? 0) ^ (right[i] ?? 0)
  return difference === 0
}

export async function isFromTwilio(authToken: string, url: string, params: Record<string, string>, signature: string | null): Promise<boolean> {
  if (!authToken || !signature) return false
  return sameText(await twilioSignature(authToken, url, params), signature)
}

const escapeXml = (text: string) =>
  text.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char]!)

/** A TwiML reply. With no message, Twilio sends nothing back. */
export function twiml(message?: string): Response {
  const body = message ? `<Response><Message>${escapeXml(message)}</Message></Response>` : '<Response/>'
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>${body}`, {
    headers: { 'content-type': 'text/xml; charset=utf-8', 'cache-control': 'no-store' },
  })
}
