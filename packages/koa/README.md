# `@soid/koa`

Give your koa-based Solid service a Solid-OIDC-compatible identity.

## Usage

```ts
import { solidIdentity, getAuthenticatedFetch } from '@soid/koa'

const webId = 'https://service.example/profile/card#bot'

// register the middleware
app.use(solidIdentity(webId))

// use the authenticated fetch to make authenticated requests to Solid Pods or other Solid-compatible services
const fetch = getAuthenticatedFetch(webId)
```
