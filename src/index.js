import { useRef, useState } from "react";

import useOpenHandler from "./open-handler";
import useSendHandler from "./send-handler";
import useSocketInstance from "./socket-instance";
import useMessageHandler from "./message-handler";
import useSocketReadyState from "./ready-state";
import useSocketKeepAlive from "./keep-alive";

const useMessageQueue = () => useRef([]);

const useSocket = (
	url,
	{ keepAlive, keepAliveMaxDelay = 15000, socketDelay } = {}
) => {
	const [keepAliveAttempts, setKeepAliveAttempts] = useState(0);

	const messageQueue = useMessageQueue();

	const socket = useSocketInstance(
		url,
		keepAlive,
		keepAliveAttempts,
		socketDelay
	);
	const readyState = useSocketReadyState(socket);

	useSocketKeepAlive({
		socket,
		keepAlive,
		keepAliveMaxDelay,
		keepAliveAttempts,
		setKeepAliveAttempts
	});

	const send = useSendHandler({ socket, messageQueue });
	useOpenHandler({ messageQueue, send, socket });

	return {
		useMessageHandler: onMessage => useMessageHandler(socket, onMessage),
		readyState,
		keepAliveAttempts,
		send
	};
};

export default useSocket;
