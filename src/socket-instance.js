import { useEffect, useState } from "react";

const useSocketInstance = url => {
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		let s;
		if (url) {
			s = new WebSocket(url);
			setSocket(s);
		}

		return () => s && s.close();
	}, [url]);

	return socket;
};

export default useSocketInstance;
