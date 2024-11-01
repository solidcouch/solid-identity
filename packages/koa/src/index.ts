import Router from '@koa/router'
import { getEndpoints } from '@soid/core'
export { getAuthenticatedFetch } from '@soid/core'

export const solidIdentity = (identity: string, baseUrl?: string) => {
  const router = new Router()

  const endpoints = getEndpoints(identity, baseUrl)

  for (const endpoint of endpoints) {
    router[endpoint.method](endpoint.path, async ctx => {
      const accepted = ctx.request.accepts(Object.keys(endpoint.body))

      ctx.body = accepted
        ? endpoint.body[accepted]
        : endpoint.body[endpoint.defaultContentType]

      ctx.set('content-type', accepted || endpoint.defaultContentType)
    })
  }

  return router
}
