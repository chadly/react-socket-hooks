# React Socket Hooks

> A set of react hooks to work real nice with the WebSocket API.

```js
const mySocketMessageHandler = msg => console.log(msg);

const { send } = useSocket("wss://example.com", { onMessage: mySocketMessageHandler });

// …later, perhaps in response to a user action
send("hello, server");
```

Install with [Yarn](https://yarnpkg.com/en/):

```shell
yarn add react-socket-hooks
```

or if Yarn isn't your thing:

```shell
npm install react-socket-hooks --save
```

This library makes use of and assumes the [`WebSocket` API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) is available on the global scope. You will need to polyfill it if it is not available in the current environment.

## Build/Run Locally

After cloning this repo, run:

```shell
yarn
yarn lint
yarn test
yarn compile
```
