import { useEffect, useState } from "react";
import { useSocketScope } from "./scope";

export const DELAY = 100;

const useSocketInstance = (url, keepAlive, keepAliveSignal) => {
	const [socket, setSocket] = useState(null);
	const acquireScopedSocket = useSocketScope();

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
				if (s.release) {
					s.release(url);
				} else {
					s.close();
				}
			}
		};
	}, [acquireScopedSocket, keepAlive, keepAliveSignal, url]);

	return socket;
};

export default useSocketInstance;
