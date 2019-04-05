import { useCallback } from "react";

const useMessageHandler = onMessage =>
	useCallback(
		evt => {
			if (evt && evt.data) {
				onMessage(JSON.parse(evt.data));
			}
		},
		[onMessage]
	);

export default useMessageHandler;
