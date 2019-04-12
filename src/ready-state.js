import { useState, useCallback, useEffect } from "react";

// need to store the socket readyState in react state so
// that we can trigger a rerender when the socket state changes
const useSocketReadyState = socket => {
	const [readyState, setReadyState] = useState();

	useEffect(() => {
		// when the socket first initialized, setup initial readyState
		if (socket) {
			setReadyState(socket.readyState);
		}
	}, [socket]);

	const handler = useCallback(() => {
		setReadyState(socket.readyState);
	}, [socket]);

	useEffect(() => {
		if (socket) {
			socket.addEventListener("open", handler);
			socket.addEventListener("error", handler);
			socket.addEventListener("close", handler);
		}

		return () => {
			if (socket) {
				socket.removeEventListener("open", handler);
				socket.removeEventListener("error", handler);
				socket.removeEventListener("close", handler);
			}
		};
	}, [socket, handler]);

	return readyState;
};

export default useSocketReadyState;
