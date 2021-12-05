/**
 * Base class for requests kicking off Credential Issuance and Presentation Exchange.
 * Additional notes on JWM format:
 * - namespaced `type` values in this implementation include:
 *    https://verity.id/types/CredentialOffer | https://verity.id/types/VerificationRequest
 * - implementors should consider using `from` and `reply_to` especially when these
 *   entities differ and additional application-specific validation should be performed.
 */
export type SubmissionOffer = {
  id: string
  type: string
  created_time: number
  expires_time: number
  reply_url: string
  from?: string
  reply_to?: [string]

  body: {
    challenge: string
    status_url?: string
  }
}