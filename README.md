# React Socket Hooks

> A set of react hooks to work real nice with the [`WebSocket` API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket).

```js
const { send } = useSocket("wss://example.com", {
	onMessage: msg => console.log(msg)
});

// …later, perhaps in response to a user action
send("hello, server");
```

See more [in-depth examples](#examples).

## Install

Install with [Yarn](https://yarnpkg.com/en/):

```shell
yarn add react-socket-hooks
```

or if Yarn isn't your thing:

```shell
npm install react-socket-hooks --save
```

This library makes use of and assumes the [`WebSocket` API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) is available on the global scope. You will need to polyfill it if it is not available in the current environment.

## Examples

```js
import React from "react";
import { useFetch } from "react-fetch-hooks";

const MyBanana = ({ id }) => {
	const { isFetching, isFetched, error, data: banana } =
		useFetch(`https://api.example.com/bananas/${id}`);

	if (isFetching) {
		return <span>Loading...</span>;
	}

	if (error) {
		// the error message will be parsed from the HTTP response, if available
		return <span>Some shit broke: {error}</span>;
	}

	return <span>My banana is {banana.color}!</span>;
};
```

This will make a `GET` request to `api.example.com` whenever the `id` prop passed to the component changes. It will then return the status of the data being loaded as well as the data when it is ready. The `useFetch` hook takes all the same parameters/options as the [standard fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

## Build/Run Locally

After cloning this repo, run:

```shell
yarn
yarn lint
yarn test
yarn compile
```
