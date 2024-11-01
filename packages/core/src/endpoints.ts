import { fullJwkPublicKey } from './identity.js'

export interface Endpoint {
  method: 'get'
  path: string
  body: Record<string, object | string>
  defaultContentType: string
}

export const getEndpoints = (webId: string, issuer?: string): Endpoint[] => {
  const { pathname, hash, origin } = new URL(webId)

  issuer = issuer ? new URL(issuer).origin : origin

  // make sure that issuer doesn't contain any unwanted paths etc.
  issuer = new URL(issuer).origin

  const endpoints: Endpoint[] = [
    {
      method: 'get',
      path: '/.well-known/openid-configuration',
      body: {
        'application/json': {
          issuer,
          jwks_uri: new URL('/jwks', issuer).toString(),
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

  if (issuer === origin) {
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
