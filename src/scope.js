import React, {
	createContext,
	useState,
	useRef,
	useCallback,
	useContext
} from "react";

const SocketScopeContext = createContext();

export const useSocketScope = () => useContext(SocketScopeContext);

export const Provider = ({ children }) => {
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

			socket.release = () => {
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
			};

			sockets.current[url] = socket;
		}

		setCounts(cnts => ({ ...cnts, [url]: (cnts[url] || 0) + 1 }));

		return socket;
	}, []);

	return (
		<SocketScopeContext.Provider value={acquire}>
			{children}
		</SocketScopeContext.Provider>
	);
};
