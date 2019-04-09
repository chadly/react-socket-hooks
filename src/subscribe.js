import { useEffect } from "react";

const useSocketSubscription = (socket, event, handler) =>
	useEffect(() => {
		if (socket) {
			socket.addEventListener(event, handler);
		}

		return () => {
			if (socket) {
				socket.removeEventListener(event, handler);
			}
		};
	}, [event, handler, socket]);

export default useSocketSubscription;
