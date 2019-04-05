import { useCallback } from "react";

const useOpenHandler = ({ messageQueue, send }) =>
	useCallback(() => {
		while (messageQueue.current.length > 0) {
			// send any queued messages on the socket now that it is open
			var msg = messageQueue.current.shift();
			send(msg);
		}
	}, [messageQueue, send]);

export default useOpenHandler;
