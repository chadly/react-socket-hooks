import { useRef } from "react";

import useOpenHandler from "./open-handler";
import useSendHandler from "./send-handler";
import useSocketInstance from "./socket-instance";
import useMessageHandler from "./message-handler";

const useSocket = (url, { onMessage } = {}) => {
	const messageQueue = useRef([]);
	const socket = useRef(null);

	const send = useSendHandler({ socket, messageQueue });
	const openHandler = useOpenHandler({ messageQueue, send });

	useSocketInstance({ socket, openHandler, send, url });
	useMessageHandler({ socket, onMessage });

	return { send };
};

export default useSocket;
