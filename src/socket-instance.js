import { useEffect, useState } from "react";
import { useSocketScope } from "./scope";

const useSocketInstance = url => {
	const [socket, setSocket] = useState(null);
	const acquireScopedSocket = useSocketScope();

	useEffect(() => {
		let s;

		if (url) {
			if (acquireScopedSocket) {
				s = acquireScopedSocket(url);
			} else {
				s = new WebSocket(url);
			}

			setSocket(s);
		}

		return () => {
			if (s) {
				if (s.release) {
					s.release(url);
				} else {
					s.close();
				}
			}
		};
	}, [acquireScopedSocket, url]);

	return socket;
};

export default useSocketInstance;
