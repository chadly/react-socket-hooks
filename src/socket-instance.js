import { useEffect, useState } from "react";
import { useAcquireSocket, useReleaseSocket } from "./scope";
import useSocketRegistry from "./registry";

const useSocketAcquisition = socketDelay => {
	const { acquire, release } = useSocketRegistry(socketDelay);
	const acquireScoped = useAcquireSocket();
	const releaseScoped = useReleaseSocket();

	return {
		acquire: acquireScoped || acquire,
		release: releaseScoped || release
	};
};

const useSocketInstance = (url, keepAlive, keepAliveSignal, socketDelay) => {
	const [socket, setSocket] = useState(null);
	const { acquire, release } = useSocketAcquisition(socketDelay);

	useEffect(() => {
		let sock, cancelAcquire;

		if (url) {
			cancelAcquire = acquire(url, keepAlive, s => {
				sock = s;
				setSocket(s);
				cancelAcquire = null;
			});
		}

		return () => {
			if (cancelAcquire) {
				cancelAcquire();
			}

			if (sock) {
				release(sock.url);
			}
		};
	}, [url, keepAlive, keepAliveSignal, acquire, release]);

	return socket;
};

export default useSocketInstance;
