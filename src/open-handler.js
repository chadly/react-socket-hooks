import { useCallback, useEffect } from "react";

const useOpenHandler = ({ messageQueue, send, socket }) => {
	const openHandler = useCallback(() => {
		while (messageQueue.current.length > 0) {
			// send any queued messages on the socket now that it is open
			var msg = messageQueue.current.shift();
			send(msg);
		}
	}, [messageQueue, send]);

	useEffect(() => {
		if (socket) {
			socket.addEventListener("open", openHandler);
		}

		return () => socket && socket.close();
	}, [openHandler, socket]);
};

export default useOpenHandler;
