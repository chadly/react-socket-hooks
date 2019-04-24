import { useState, useCallback, useRef } from "react";

const useSocketRegistry = () => {
	const sockets = useRef({});
	const [, setCounts] = useState({});

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

			if (newCount == 0) {
				sockets.current[url].close();
				delete sockets.current[url];

				return { ...counts, [url]: null };
			}

			return {
				...counts,
				[url]: newCount
			};
		});
	}, []);

	return { acquire, release };
};

export default useSocketRegistry;
