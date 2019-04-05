import { useCallback, useEffect, useRef } from "react";

const useSocketHandler = onMessage =>
	useCallback(
		evt => {
			if (evt && evt.data) {
				onMessage(JSON.parse(evt.data));
			}
		},
		[onMessage]
	);

const useSocket = (url, { onMessage } = {}) => {
	const messageQueue = useRef([]);
	const socket = useRef(null);
	const messageHandler = useSocketHandler(onMessage);

	const send = useCallback(message => {
		if (socket.current.readyState === WebSocket.OPEN) {
			socket.current.send(JSON.stringify(message));
		} else {
			messageQueue.current.push(message);
		}
	}, []);

	useEffect(() => {
		socket.current = new WebSocket(url);
		socket.current.addEventListener("open", () => {
			while (messageQueue.current.length > 0) {
				// send any queued messages on the socket now that it is open
				var msg = messageQueue.current.shift();
				send(msg);
			}
		});
		return () => socket.current && socket.current.close();
	}, [send, url]);

	useEffect(() => {
		if (onMessage && socket.current) {
			socket.current.addEventListener("message", messageHandler);
		}
		return () => {
			if (onMessage && socket) {
				socket.current.removeEventListener("message", messageHandler);
			}
		};
	}, [messageHandler, onMessage]);

	return { send };
};

export default useSocket;
