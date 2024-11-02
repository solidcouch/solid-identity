# `@soid/koa`

Give your koa-based Solid service a Solid-OIDC-compatible identity.

## Overview

This library provides:

- identity-serving middleware for your koa-based service: `solidIdentity(webId: string, issuer?: string)`
- authenticated fetch that your service can use to access protected resources: `await getAuthenticatedFetch(webId: string, issuer?: string)`

If you want to serve identity for a koa-incompatible service, consider using lower level [`@soid/core`](https://npmjs.com/package/@soid/core), or [open an issue](https://github.com/solidcouch/solid-identity/issues).

## Usage

### Installation

```bash
npm install --save @soid/koa
# or
yarn add @soid/koa
```

### Identity for service's own webId

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

### Identity for custom webId

You can also authenticate your service with custom webId (for example your own webId)

You MUST add triple `<webId> solid:oidcIssuer <issuer>.` to your webId, where `issuer` MUST match the origin of the service. (no trailing slashes!)

```ts
import Koa from 'koa'
import Router from '@koa/router'
import { solidIdentity, getAuthenticatedFetch } from '@soid/koa'

// The webId must serve a profile in text/turtle, and has to contain the required triple pointing to the issuer
const webId = 'https://custom.webid/profile/card#me'
// The issuer has to match your service's origin
const issuer = 'https://service.example'

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
