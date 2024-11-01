import { parseLinkHeader } from '@solid/community-server'
import { createAccount, getAuthenticatedFetch } from 'css-authn/dist/7.x.js'
import { randomUUID } from 'node:crypto'
import { expect } from 'vitest'
import { Person } from './types.js'

export const createRandomAccount = async ({
  solidServer,
}: {
  solidServer: string
}) => {
  const account = await createAccount({
    username: randomUUID(),
    password: randomUUID(),
    email: randomUUID() + '@example.com',
    provider: solidServer,
  })

  const authenticatedFetch = await getAuthenticatedFetch({
    email: account.email,
    password: account.password,
    provider: solidServer,
  })

  return { ...account, fetch: authenticatedFetch }
}

/**
 * Find link to ACL document for a given URI
 */
export const getAcl = async (
  uri: string,
  ffetch: typeof globalThis.fetch = globalThis.fetch,
) => {
  const response = await ffetch(uri, { method: 'HEAD' })
  expect(response.ok).toEqual(true)
  const linkHeader = response.headers.get('link')
  const links = parseLinkHeader(linkHeader ?? '')
  const aclLink = links.find(link => link.parameters.rel === 'acl')
  const aclUri = aclLink?.target
  if (!aclUri) throw new Error(`We could not find WAC link for ${uri}`)
  // if aclUri is relative, return absolute uri
  return new URL(aclUri, uri).toString()
}

export const getContainer = (uri: string) =>
  uri.substring(0, uri.lastIndexOf('/') + 1)

export const getResource = (uri: string) => {
  const url = new URL(uri)
  const clearedUrl = new URL(url.pathname, url.origin).toString()
  return clearedUrl
}

export const getDefaultPerson = async (
  {
    email,
    password,
    pods: [{ name }],
  }: {
    email: string
    password: string
    pods: [{ name: string }]
  },
  cssUrl: string,
): Promise<Person> => {
  const podUrl = `${cssUrl}/${name}/`
  const withoutFetch: Omit<Person, 'fetch'> = {
    podUrl,
    idp: cssUrl + '/',
    webId: podUrl + 'profile/card#me',
    username: name,
    password,
    email,
  }
  return {
    ...withoutFetch,
    fetch: await getAuthenticatedFetch({ ...withoutFetch, provider: cssUrl }),
  }
}

export function getRandomPort(): number {
  // Generate a random number between 1024 and 65535
  const min = 1024
  const max = 65535
  return Math.floor(Math.random() * (max - min + 1)) + min
}
