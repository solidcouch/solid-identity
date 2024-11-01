# `@soid/koa`

Give your koa-based Solid service a Solid-OIDC-compatible identity.

## Usage

### Service's own webId

By default, your service can serve its own webId.

```ts
import Koa from 'koa'
import Router from '@koa/router'
import { solidIdentity, getAuthenticatedFetch } from '@soid/koa'

// The webId origin MUST match your service origin
const webId = 'https://service.example/profile/card#bot'

const app = new Koa()
const router = new Router()

// register the identity middleware in your router
router.use(solidIdentity(webId).routes())
// register your other routes
// ...

app.use(router.routes()).use(router.allowedMethods())

// use the authenticated fetch to make authenticated requests to Solid Pods or other Solid-compatible services
const fetch = getAuthenticatedFetch(webId)
```

### Custom webId

You can also authenticate your service with custom webId (for example your own webId)

You MUST add triple `<webId> solid:oidcIssuer <issuer>.` to your webId, where `issuer` MUST match the origin of the service. (no trailing slashes!)

```ts
import Koa from 'koa'
import Router from '@koa/router'
import { solidIdentity, getAuthenticatedFetch } from '@soid/koa'

const webId = 'https://custom.webid/profile/card#me' // you'll have to serve this somewhere, and add the required triple
const issuer = 'https://service.example' // this has to match your service's origin

const app = new Koa()
const router = new Router()

// register the identity middleware in your router
router.use(solidIdentity(webId, issuer).routes())
// register your other routes
// ...

app.use(router.routes()).use(router.allowedMethods())

// use the authenticated fetch to make authenticated requests to Solid Pods or other Solid-compatible services
const fetch = getAuthenticatedFetch(webId, issuer)
```
