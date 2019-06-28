import { useCallback, useEffect, useRef, useState } from "react";

const useSocketAcquisition = socketDelay => {
	const socket = useRef({});
	const socketsToClear = useRef({});

	const [resetSignal, setResetCount] = useState(0);

	const acquire = useCallback(
		(url, keepAlive, cb) => {
			delete socketsToClear.current[url];

			const t = setTimeout(() => {
				let s = socket.current[url];

				const envSupportsWebSockets = !!global.WebSocket;
				const isSocketInValidState =
					s &&
					(s.readyState === WebSocket.CONNECTING ||
						s.readyState === WebSocket.OPEN);

				if (envSupportsWebSockets && (!s || !isSocketInValidState)) {
					s = new WebSocket(url);
					socket.current[url] = s;
				}

				cb(s);
			}, socketDelay);

			return () => clearTimeout(t);
		},
		[socketDelay]
	);

	const release = useCallback(url => {
		socketsToClear.current[url] = true;
		setResetCount(c => c + 1);
	}, []);

	useEffect(() => {
		let t;

		if (resetSignal > 0) {
			// cleanup socket
			t = setTimeout(() => {
				for (let url in socketsToClear.current) {
					if (socket.current[url]) {
						socket.current[url].close();
						delete socket.current[url];
					}
				}

				socketsToClear.current = {};
				t = null;
			}, socketDelay + 50);
		}

		return () => {
			if (t) {
				clearTimeout(t);
			}
		};
	}, [resetSignal, socket, socketDelay]);

	return { acquire, release };
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
				release(url);
			}
		};
	}, [url, keepAlive, keepAliveSignal, acquire, release]);

	return socket;
};

export default useSocketInstance;
