import { useEffect, useState } from "react";
import { useSocketScope } from "./scope";

const useSocketInstance = url => {
	const [socket, setSocket] = useState(null);
	const scope = useSocketScope();

	useEffect(() => {
		let s;
		if (url) {
			if (scope) {
				s = scope.acquire(url);
			} else {
				s = new WebSocket(url);
				setSocket(s);
			}
		}

		return () => {
			if (scope && url) {
				scope.release(url);
			} else if (s) {
				s.close();
			}
		};
	}, [scope, url]);

	return socket;
};

export default useSocketInstance;
