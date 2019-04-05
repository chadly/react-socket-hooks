import { useRef } from "react";
import useMessageHandler from "./message-handler";
import useOpenHandler from "./open-handler";
import useSendHandler from "./send-handler";
import usePopulateSocketInstance from "./populate-socket-instance";
import useAttachMessageHandlers from "./attach-message-handlers";

const useSocket = (url, { onMessage } = {}) => {
	const messageQueue = useRef([]);
	const socket = useRef(null);

	const messageHandler = useMessageHandler(onMessage);
	const send = useSendHandler({ socket, messageQueue });
	const openHandler = useOpenHandler({ messageQueue, send });

	usePopulateSocketInstance({ socket, openHandler, send, url });
	useAttachMessageHandlers({ socket, onMessage, messageHandler });

	return { send };
};

export default useSocket;
