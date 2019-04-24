import { useState, useCallback, useEffect, useRef } from "react";

const ACQUIRE_DELAY = 100;
const CLEANUP_DELAY = 150;

const useSocketRegistry = () => {
	const sockets = useRef({});
	const [counts, setCounts] = useState({});

	const acquire = useCallback((url, keepAlive, cb) => {
		const t = setTimeout(() => {
			let socket = sockets.current[url];

			if (
				!socket ||
				(socket &&
					keepAlive &&
					socket.readyState != WebSocket.CONNECTING &&
					socket.readyState != WebSocket.OPEN)
			) {
				socket = new WebSocket(url);
				sockets.current[url] = socket;
			}

			setCounts(cnts => ({ ...cnts, [url]: (cnts[url] || 0) + 1 }));
			cb(socket);
		}, ACQUIRE_DELAY);

		return () => clearTimeout(t);
	}, []);

	const release = useCallback(url => {
		setCounts(counts => {
			const count = counts[url];
			if (!count) return counts;

			const newCount = count - 1;

			return {
				...counts,
				[url]: newCount
			};
		});
	}, []);

	useEffect(() => {
		// cleanup zero-ref sockets
		const t = setTimeout(() => {
			for (let url in counts) {
				if (counts[url] == 0 && sockets.current[url]) {
					sockets.current[url].close();
					delete sockets.current[url];
				}
			}
		}, CLEANUP_DELAY);

		return () => clearTimeout(t);
	}, [counts]);

	return { acquire, release };
};

export default useSocketRegistry;
