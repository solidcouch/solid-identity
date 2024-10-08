import {
  buildAuthenticatedFetch,
  generateDpopKeyPair,
} from '@inrupt/solid-client-authn-core'
import { calculateJwkThumbprint, SignJWT } from 'jose'
import { createHash, generateKeyPairSync, randomUUID } from 'node:crypto'

const tokenKeyPair = generateKeyPairSync('ec', { namedCurve: 'P-256' })

const jwkPublicKey = tokenKeyPair.publicKey.export({ format: 'jwk' })

const kid = createHash('sha256')
  .update(JSON.stringify(jwkPublicKey))
  .digest('base64url')

export const fullJwkPublicKey = {
  ...jwkPublicKey,
  use: 'sig',
  alg: 'ES256',
  kid,
}

export const getAuthenticatedFetch = async (
  webId: string,
): Promise<typeof globalThis.fetch> => {
  const { origin: baseUrl } = new URL(webId)
  const dpopKey = await generateDpopKeyPair()

  const jkt = await calculateJwkThumbprint(
    dpopKey.publicKey as Parameters<typeof calculateJwkThumbprint>[0],
    'sha256',
  )

  const now = Math.floor(Date.now() / 1000)

  const token = await new SignJWT({
    webid: `${baseUrl}/profile/card#bot`,
    sub: `${baseUrl}/profile/card#bot`, // Bot's WebID
    cnf: { jkt },
  })
    .setProtectedHeader({ alg: 'ES256', typ: 'at+jwt', kid })
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .setAudience('solid')
    .setIssuer(baseUrl)
    .setJti(randomUUID())
    .sign(tokenKeyPair.privateKey)

  return await buildAuthenticatedFetch(token, { dpopKey })
}
