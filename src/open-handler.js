import { useCallback } from "react";
import useSocketSubscription from "./subscribe";

const useOpenHandler = ({ messageQueue, send, socket }) => {
	const openHandler = useCallback(() => {
		while (messageQueue.current.length > 0) {
			// send any queued messages on the socket now that it is open
			var msg = messageQueue.current.shift();
			send(msg);
		}
	}, [messageQueue, send]);

	useSocketSubscription(socket, "open", openHandler);
};

export default useOpenHandler;
