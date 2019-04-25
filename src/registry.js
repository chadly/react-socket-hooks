import { useState, useCallback, useEffect, useRef } from "react";

const useSocketRegistry = (delay = 100) => {
	const sockets = useRef({});
	const [counts, setCounts] = useState({});

	const acquire = useCallback(
		(url, keepAlive, cb) => {
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
			}, delay);

			return () => clearTimeout(t);
		},
		[delay]
	);

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
		}, delay + 50);

		return () => clearTimeout(t);
	}, [counts, delay]);

	return { acquire, release };
};

export default useSocketRegistry;
