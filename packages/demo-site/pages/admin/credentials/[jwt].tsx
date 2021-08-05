import RevokeButton from "@centre/demo-site/components/issuer/RevokeButton"
import {
  decodeVerifiableCredential,
  fetchStatusList,
  RevocableCredential,
  RevocationListCredential
} from "@centre/verity"
import { isRevoked } from "@centre/verity"
import { NextPage } from "next"
import Link from "next/link"
import { useState } from "react"
import AdminLayout from "../../../components/admin/Layout"
import { requireAdmin } from "../../../lib/auth-fns"
import { findUserByCredential, User } from "../../../lib/database"

type Props = {
  credential: RevocableCredential
  revocationList: RevocationListCredential
  revoked: boolean
  user: User
}

export const getServerSideProps = requireAdmin<Props>(async (context) => {
  const jwt = context.params.jwt as string
  const credential = (await decodeVerifiableCredential(
    jwt
  )) as RevocableCredential

  if (!credential) {
    return {
      redirect: {
        permanent: false,
        destination: "/admin"
      }
    }
  }

  const revocationList = await fetchStatusList(credential)
  const revoked = await isRevoked(credential, revocationList)

  const user = await findUserByCredential(jwt)

  return {
    props: {
      credential: JSON.parse(JSON.stringify(credential)),
      revocationList: JSON.parse(JSON.stringify(revocationList)),
      revoked,
      user
    }
  }
})

const AdminCredentialPage: NextPage<Props> = ({
  credential,
  revocationList,
  revoked,
  user
}) => {
  // Revocation List can change if we revoke the credential so we need to store state
  const [list, setList] = useState<RevocationListCredential>(revocationList)

  return (
    <AdminLayout title="Credential Details">
      <div className="prose">
        <h2>
          User: <Link href={`/admin/users/${user.id}`}>{user.email}</Link>
        </h2>
        <p>
          Note: We can only reconcile this credential to a specific user in the
          system because we stored it when issuing the credential. No one else
          would know their email address or other identifying information. See
          the credential below.
        </p>
        <p>
          You can revoke the credential using the button below. Notice that
          credentials are immutable. After revoking the credential, the
          revocation list credential is updated. You will see the `encodedList`
          property change.
        </p>
        <p>
          <RevokeButton
            credential={credential}
            defaultRevoked={revoked}
            onToggle={async (revocationList) => setList(revocationList)}
          />
        </p>

        <h2>Credential</h2>

        <p>
          <pre className="overflow-x-scroll">
            {JSON.stringify(credential, null, 4)}
          </pre>
        </p>

        <h2>Revocation List Credential</h2>

        <p>
          <pre className="overflow-x-scroll">
            {JSON.stringify(list, null, 4)}
          </pre>
        </p>
      </div>
    </AdminLayout>
  )
}

export default AdminCredentialPage
