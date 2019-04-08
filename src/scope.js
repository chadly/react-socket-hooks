import React, {
	createContext,
	useState,
	useMemo,
	useCallback,
	useContext
} from "react";

const SocketScopeContext = createContext();

export const useSocketScope = () => useContext(SocketScopeContext);

export const Provider = ({ children }) => {
	const [, setSockets] = useState({});

	const acquire = useCallback(url => {
		let s;

		setSockets(sockets => {
			if (sockets[url]) {
				s = sockets[url].socket;
				return {
					...sockets,
					[url]: { ...sockets[url], count: sockets[url].count + 1 }
				};
			}

			s = new WebSocket(url);
			return { ...sockets, [url]: { socket: s, count: 1 } };
		});

		return s;
	}, []);

	const release = useCallback(url => {
		setSockets(sockets => {
			const s = sockets[url];
			if (!s) return sockets;

			const newCount = s.count - 1;

			if (newCount == 0) {
				s.socket.close();
				return { ...sockets, [url]: null };
			}

			return {
				...sockets,
				[url]: { ...s, count: newCount }
			};
		});
	}, []);

	const ctxVal = useMemo(() => ({ acquire, release }), [acquire, release]);

	return (
		<SocketScopeContext.Provider value={ctxVal}>
			{children}
		</SocketScopeContext.Provider>
	);
};
