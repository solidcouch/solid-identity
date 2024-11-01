# `@soid/core`

Give your Solid service a Solid-OIDC-compatible identity.

## Overview

This library:

- tells you which endpoints your service has to serve
- provides authenticated fetch that your service can use to access protected resources

Please consider using higher-level libraries like [`@soid/koa`](https://npmjs.com/package/@soid/koa).

## Usage

### Service's own webId

By default, your service can serve its own webId.

```ts
import { getEndpoints, getAuthenticatedFetch } from '@soid/core'

// The webId's origin has to match the service's origin
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

### Custom webId

You can also authenticate your service with custom webId (for example your own webId)

You MUST add triple `<webId> solid:oidcIssuer <issuer>.` to your webId, where `issuer` MUST match the origin of the service. (no trailing slashes!)

```ts
import { getEndpoints, getAuthenticatedFetch } from '@soid/core'

const webId = 'https://custom.webid/profile/card#me' // you'll have to serve this somewhere, and add the required triple
const issuer = 'https://service.example' // this has to match your service's origin

// Get authenticated fetch to make requests with this identity
const authenticatedFetch = await getAuthenticatedFetch(webId, issuer)

// Get configuration of endpoints that your service MUST serve
const endpoints = getEndpoints(webId, issuer)
```
