import type { CredentialOffer } from "@centre/verity"
import { manifestWrapper } from "@centre/verity"
import { v4 as uuidv4 } from "uuid"
import { apiHandler } from "../../../../../lib/api-fns"
import { NotFoundError } from "../../../../../lib/errors"
import { MANIFEST_MAP } from "../../../../../lib/manifest"
import { fullURL } from "../../../../../lib/utils"

export default apiHandler<CredentialOffer>(async (req, res) => {
  const manifestName = req.query.type as string
  const token = req.query.token as string
  const manifest = MANIFEST_MAP[manifestName]

  if (!manifest) {
    throw new NotFoundError()
  }

  res.json(
    manifestWrapper(
      uuidv4(),
      manifest,
      process.env.ISSUER_DID,
      fullURL(`/api/issuance/${token}`)
    )
  )
})