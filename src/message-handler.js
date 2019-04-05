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
		let socketNow = socket && socket.current;

		if (socketNow) {
			socketNow.addEventListener("message", messageHandler);
		}

		return () => {
			if (socketNow) {
				socketNow.removeEventListener("message", messageHandler);
			}
		};
	}, [messageHandler, socket]);
};

export default useMessageHandler;
