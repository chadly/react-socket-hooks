import { useEffect } from "react";

const useAttachMessageHandlers = ({ socket, onMessage, messageHandler }) =>
	useEffect(() => {
		let socketNow = socket && socket.current;

		if (onMessage && socketNow) {
			socketNow.addEventListener("message", messageHandler);
		}
		return () => {
			if (onMessage && socketNow) {
				socketNow.removeEventListener("message", messageHandler);
			}
		};
	}, [messageHandler, onMessage, socket]);

export default useAttachMessageHandlers;
