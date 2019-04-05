import { useCallback, useEffect } from "react";

const useMessageHandler = ({ socket, onMessage }) => {
	const messageHandler = useCallback(
		evt => {
			if (evt && evt.data && onMessage) {
				onMessage(JSON.parse(evt.data));
			}
		},
		[onMessage]
	);

	useEffect(() => {
		if (socket) {
			socket.addEventListener("message", messageHandler);
		}

		return () => {
			if (socket) {
				socket.removeEventListener("message", messageHandler);
			}
		};
	}, [messageHandler, socket]);
};

export default useMessageHandler;
