import { useEffect, useState } from "react";
import { useAcquireSocket, useReleaseSocket } from "./scope";
import useSocketRegistry from "./registry";

export const DELAY = 100;

const useSocketAcquisition = () => {
	const { acquire, release } = useSocketRegistry();
	const acquireScoped = useAcquireSocket();
	const releaseScoped = useReleaseSocket();

	return {
		acquire: acquireScoped || acquire,
		release: releaseScoped || release
	};
};

const useSocketInstance = (url, keepAlive, keepAliveSignal) => {
	const [socket, setSocket] = useState(null);
	const { acquire, release } = useSocketAcquisition();

	useEffect(() => {
		let s, t;

		if (url) {
			t = setTimeout(() => {
				s = acquire(url, keepAlive);
				setSocket(s);
				t = null;
			}, DELAY);
		}

		return () => {
			if (t) {
				clearTimeout(t);
			}

			if (s) {
				release(s.url);
			}
		};
	}, [url, keepAlive, keepAliveSignal, acquire, release]);

	return socket;
};

export default useSocketInstance;
