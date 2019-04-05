import { useRef } from "react";

import useOpenHandler from "./open-handler";
import useSendHandler from "./send-handler";
import useSocketInstance from "./socket-instance";
import useMessageHandler from "./message-handler";

const useMessageQueue = () => useRef([]);

const useSocket = (url, { onMessage } = {}) => {
	const messageQueue = useMessageQueue();

	const socket = useSocketInstance(url);

	const send = useSendHandler({ socket, messageQueue });
	useOpenHandler({ messageQueue, send, socket });
	useMessageHandler({ socket, onMessage });

	return { send };
};

export default useSocket;
