import { useCallback } from "react";

const useSendHandler = ({ socket, messageQueue }) =>
	useCallback(
		message => {
			if (!global.WebSocket) {
				throw new Error(
					"Attempt to send WebSocket message in unsupported environment."
				);
			}
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify(message));
			} else {
				messageQueue.current.push(message);
			}
		},
		[messageQueue, socket]
	);

export default useSendHandler;
