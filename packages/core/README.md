# `@soid/core`

Give your Solid service a Solid-OIDC-compatible identity.

## Usage

```ts
import { getEndpoints, getAuthenticatedFetch } from '@soid/core'

const webId = 'https://service.example/profile/card#bot'
// Get authenticated fetch to make requests with this identity
const authenticatedFetch = await getAuthenticatedFetch(webId)

// Get array of configuration for endpoints that your service needs to serve
const endpoints = getEndpoints(webId)
// [{
//   method: 'get',
//   path: '/path/to/endpoint',
//   body: {
//     'text/turtle': '<a> <b> <c>.',
//     'application/json': { a: 'b' },
//   },
//   defaultContentType: 'text/turtle',
// }]
```

Please consider using higher-level libraries like [`@soid/koa`](https://npmjs.com/package/@soid/koa).
