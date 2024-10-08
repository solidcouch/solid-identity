# `@soid/koa`

Give your koa-based Solid service a Solid-OIDC-compatible identity.

## Usage

```ts
import Koa from 'koa'
import Router from '@koa/router'
import { solidIdentity, getAuthenticatedFetch } from '@soid/koa'

const webId = 'https://service.example/profile/card#bot'

const app = new Koa()
const router = new Router()

// register the identity middleware in your router
router.use(solidIdentity(webId).routes())
// register your other routes
// ...

app.use(router)

// use the authenticated fetch to make authenticated requests to Solid Pods or other Solid-compatible services
const fetch = getAuthenticatedFetch(webId)
```
