import Router from '@koa/router'
import { App, AppRunner, joinFilePath } from '@solid/community-server'
import Koa from 'koa'
import * as msw from 'msw'
import * as mswNode from 'msw/node'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { getAuthenticatedFetch, solidIdentity } from '../index.js'
import { getDefaultPerson } from './helpers/index.js'
import { createResource } from './helpers/setupPod.js'
// import { dirname } from 'node:path'
// import { fileURLToPath } from 'node:url'

// const __dirname = dirname(fileURLToPath(import.meta.url))

let css: App

beforeAll(async () => {
  const start = Date.now()
  // eslint-disable-next-line no-console
  console.log('Initializing CSS server.')
  css = await new AppRunner().create({
    shorthand: {
      port: 4000,
      // loggingLevel: 'off',
      seedConfig: joinFilePath(__dirname, './css-pod-seed.json'), // set up some Solid accounts
    },
  })
  // eslint-disable-next-line no-console
  console.log(
    'CSS server initialized in',
    Math.floor((Date.now() - start) / 100) / 10,
    's.',
  )
}, 25000)

// start community solid server
beforeEach(async () => {
  await css.stop()
  await css.start()
})

const setupServer = (...props: Parameters<typeof solidIdentity>) => {
  const app = new Koa()
  const router = new Router()
  router.use(solidIdentity(...props).routes())
  app.use(router.allowedMethods()).use(router.routes())
  return app
}

const startServer = (app: ReturnType<typeof setupServer>, port: number) =>
  new Promise<ReturnType<typeof app.listen>>(resolve => {
    const server: ReturnType<typeof app.listen> = app.listen(port, () => {
      resolve(server)
    })
  })

const stopServer = (server: Awaited<ReturnType<typeof startServer>>) =>
  new Promise<void>((resolve, reject) =>
    server.close(err => (err ? reject(err) : resolve())),
  )

const setupIdentityServer = ({
  webId,
  provider,
}: {
  webId: string
  provider: string
}) => {
  const { pathname, origin, hash } = new URL(webId)

  const url = new URL(pathname, origin).toString()

  return mswNode.setupServer(
    msw.http.get(url, () =>
      msw.HttpResponse.text(
        `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
          @prefix foaf: <http://xmlns.com/foaf/0.1/>.
          @base <${new URL(pathname, origin).toString()}>.
  
          <${hash}>
            a foaf:Agent;
            solid:oidcIssuer <${provider}>.
        `,
        { headers: { 'Content-Type': 'text/turtle' } },
      ),
    ),
  )
}

describe('Solid identity', () => {
  test('Default identity endpoints can be set up', async () => {
    const webId = 'http://localhost:3000/test/asdf#identity'
    const app = setupServer(webId)
    const server = await startServer(app, 3000)

    // check .well-known endpoint
    const response = await fetch(
      'http://localhost:3000/.well-known/openid-configuration',
    )
    expect(response.ok).toEqual(true)
    const body = await response.json()
    expect(body).toHaveProperty('jwks_uri')

    const jwksResponse = await fetch(body.jwks_uri)
    expect(jwksResponse.ok).toEqual(true)

    const webIdResponse = await fetch(webId)
    expect(webIdResponse.ok).toEqual(true)

    await stopServer(server)
  })

  test.todo('default webId can be extended with additional triples')

  test('Identity with external webId can be set up', async () => {
    const webId = 'http://localhost:5000/test/asdf#identity'
    const baseUrl = 'http://localhost:3000'

    const identityServer = setupIdentityServer({ webId, provider: baseUrl })
    identityServer.listen()
    const app = setupServer(webId, baseUrl)
    const server = await startServer(app, 3000)
    // check .well-known endpoint
    const response = await fetch(
      'http://localhost:3000/.well-known/openid-configuration',
    )
    expect(response.ok).toEqual(true)
    const body = await response.json()
    expect(body).toHaveProperty('jwks_uri')

    const jwksResponse = await fetch(body.jwks_uri)
    expect(jwksResponse.ok).toEqual(true)

    const webIdResponse = await fetch(webId)
    expect(webIdResponse.ok).toEqual(true)

    await stopServer(server)
    identityServer.close()
  })

  test('Fetch protected data from CSS with default identity', async () => {
    // set up the koa service and soid middleware
    const serviceWebId = 'http://localhost:3000/test/asdf#identity'
    const app = setupServer(serviceWebId)
    const server = await startServer(app, 3000)

    // setup some data on the server
    const person = await getDefaultPerson(
      {
        email: 'person@example',
        password: 'password',
        pods: [{ name: 'person' }],
      },
      'http://localhost:4000',
    )

    const resourceUrl = new URL('./testfolder/test', person.podUrl).toString()

    await createResource({
      url: resourceUrl,
      body: '<#this> a "test"',
      acls: [
        {
          permissions: ['Read', 'Write', 'Append', 'Control'],
          agents: [person.webId],
        },
        {
          permissions: ['Read'],
          agents: [serviceWebId],
        },
      ],
      authenticatedFetch: person.fetch,
    })

    // try to fetch data from CSS
    // unauthenticated fetch should fail
    const plainResponse = await fetch(resourceUrl)
    expect(plainResponse.ok).toEqual(false)

    // authenticated fetch should succeed
    const authenticatedFetch = await getAuthenticatedFetch(serviceWebId)

    const authenticatedResponse = await authenticatedFetch(resourceUrl)
    expect(authenticatedResponse.ok).toEqual(true)
    // stop the server
    await stopServer(server)
  }, 10000)

  test('Fetch protected data from CSS with custom webId identity', async () => {
    // set up the koa service and soid middleware
    const serviceWebId = 'http://localhost:5000/test/asdf#identity'
    const provider = 'http://localhost:3000'
    const app = setupServer(serviceWebId, provider)
    const server = await startServer(app, 3000)
    const identityServer = setupIdentityServer({
      webId: serviceWebId,
      provider: 'http://localhost:3000',
    })

    identityServer.listen()

    // setup some data on the server
    const person = await getDefaultPerson(
      {
        email: 'person@example',
        password: 'password',
        pods: [{ name: 'person' }],
      },
      'http://localhost:4000',
    )

    const resourceUrl = new URL('./testfolder/test', person.podUrl).toString()

    await createResource({
      url: resourceUrl,
      body: '<#this> a "test"',
      acls: [
        {
          permissions: ['Read', 'Write', 'Append', 'Control'],
          agents: [person.webId],
        },
        {
          permissions: ['Read'],
          agents: [serviceWebId],
        },
      ],
      authenticatedFetch: person.fetch,
    })

    // try to fetch data from CSS
    // unauthenticated fetch should fail
    const plainResponse = await fetch(resourceUrl)
    expect(plainResponse.ok).toEqual(false)

    // authenticated fetch should succeed
    const authenticatedFetch = await getAuthenticatedFetch(
      serviceWebId,
      provider,
    )

    const authenticatedResponse = await authenticatedFetch(resourceUrl)
    expect(authenticatedResponse.ok).toEqual(true)
    // stop the server
    await stopServer(server)
    identityServer.close()
  })
})
