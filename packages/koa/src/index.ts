import Router from '@koa/router'
import {jwkPublicKey} from '@soid/core'
export {getAuthenticatedFetch} from '@soid/core'

export const solidIdentity = (identity: string) => {

  const {hash, pathname, origin} = new URL(identity)

  const router = new Router()

  router.get('/.well-known/openid-configuration', async ctx => {
    ctx.body = {
      issuer: origin,
      jwks_uri: new URL('/jwks', identity).toString(),
      response_types_supported: ['id_token', 'token'],
      scopes_supported: ['openid', 'webid'],
    }
  })

  router.get('/jwks', async ctx => {
    ctx.body = { keys: [jwkPublicKey] }
  })

  router.get(pathname, async ctx => {
    ctx.set('Content-Type', 'text/turtle')

    ctx.body = `
    @prefix solid: <http://www.w3.org/ns/solid/terms#>.
    @prefix foaf: <http://xmlns.com/foaf/0.1/>.

    <${hash}>
        a foaf:Agent;
        solid:oidcIssuer <${origin}>.
  `
  })

  return router
}

