import { useState, useCallback, useEffect, useRef } from "react";

const useSocketRegistry = () => {
	const sockets = useRef({});
	const [counts, setCounts] = useState({});

	const acquire = useCallback((url, keepAlive) => {
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

		return socket;
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
		for (let url in counts) {
			if (counts[url] == 0 && sockets.current[url]) {
				sockets.current[url].close();
				delete sockets.current[url];
			}
		}
	}, [counts]);

	return { acquire, release };
};

export default useSocketRegistry;
