import { useCallback } from "react";
import useSocketSubscription from "./subscribe";

const useMessageHandler = (socket, onMessage) => {
	const messageHandler = useCallback(
		evt => {
			if (evt && evt.data && onMessage) {
				onMessage(JSON.parse(evt.data));
			}
		},
		[onMessage]
	);

	useSocketSubscription(socket, "message", messageHandler);
};

export default useMessageHandler;
