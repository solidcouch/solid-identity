import { fullJwkPublicKey } from './identity.js'

export interface Endpoint {
  method: 'get'
  path: string
  body: Record<string, object | string>
  defaultContentType: string
}

export const getEndpoints = (webId: string, baseUrl?: string): Endpoint[] => {
  const { pathname, hash, origin } = new URL(webId)

  const endpoints: Endpoint[] = [
    {
      method: 'get',
      path: '/.well-known/openid-configuration',
      body: {
        'application/json': {
          issuer: baseUrl ?? origin,
          jwks_uri: new URL('/jwks', baseUrl ?? origin).toString(),
          response_types_supported: ['id_token', 'token'],
          scopes_supported: ['openid', 'webid'],
        },
      },
      defaultContentType: 'application/json',
    },
    {
      method: 'get',
      path: '/jwks',
      body: { 'application/json': { keys: [fullJwkPublicKey] } },
      defaultContentType: 'application/json',
    },
  ]

  if (!baseUrl) {
    endpoints.push({
      method: 'get',
      path: pathname,
      body: {
        'text/turtle': `
        @prefix solid: <http://www.w3.org/ns/solid/terms#>.
        @prefix foaf: <http://xmlns.com/foaf/0.1/>.
        @base <${new URL(pathname, origin).toString()}>.

        <${hash}>
          a foaf:Agent;
          solid:oidcIssuer <${origin}>.
      `,
      },
      // TODO add application/ld+json
      defaultContentType: 'text/turtle',
    })
  }

  return endpoints
}
