import { useCallback } from "react";

const useSendHandler = ({ socket, messageQueue }) =>
	useCallback(
		message => {
			if (socket.current.readyState === WebSocket.OPEN) {
				socket.current.send(JSON.stringify(message));
			} else {
				messageQueue.current.push(message);
			}
		},
		[messageQueue, socket]
	);

export default useSendHandler;
