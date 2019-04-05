import { useEffect } from "react";

const useSocketInstance = ({ socket, url }) =>
	useEffect(() => {
		if (url) {
			socket.current = new WebSocket(url);
		}

		return () => socket.current && socket.current.close();
	}, [socket, url]);

export default useSocketInstance;
