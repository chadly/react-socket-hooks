import { useEffect, useState } from "react";
import { useAcquireSocket, useReleaseSocket } from "./scope";

export const DELAY = 100;

const useSocketInstance = (url, keepAlive, keepAliveSignal) => {
	const [socket, setSocket] = useState(null);
	const acquireScopedSocket = useAcquireSocket();
	const releaseScopedSocket = useReleaseSocket();

	useEffect(() => {
		let s, t;

		if (url) {
			t = setTimeout(() => {
				if (acquireScopedSocket) {
					s = acquireScopedSocket(url, keepAlive);
				} else {
					s = new WebSocket(url);
				}

				setSocket(s);
				t = null;
			}, DELAY);
		}

		return () => {
			if (t) {
				clearTimeout(t);
			}

			if (s) {
				if (releaseScopedSocket) {
					releaseScopedSocket(url);
				} else {
					s.close();
				}
			}
		};
	}, [
		url,
		acquireScopedSocket,
		releaseScopedSocket,
		keepAlive,
		keepAliveSignal
	]);

	return socket;
};

export default useSocketInstance;
