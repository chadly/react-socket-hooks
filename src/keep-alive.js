import { useCallback, useEffect, useRef } from "react";

const useSocketKeepAlive = ({
	socket,
	keepAlive,
	keepAliveAttempts: attempts,
	setKeepAliveAttempts: setAttempts
}) => {
	const timer = useRef(null);

	const handler = useCallback(() => {
		// https://favsub.com/bookmarks/edit/17993-john-ryding-blog-how-to-reconnect-web-sockets-in-a-realtime-web-app-without-flooding-the-server
		var time = generateInterval(attempts);

		timer.current = setTimeout(() => {
			setAttempts(c => c + 1);
		}, time);
	}, [attempts, setAttempts]);

	useEffect(() => {
		if (socket && keepAlive) {
			socket.addEventListener("error", handler);
			socket.addEventListener("close", handler);
		}

		return () => {
			if (socket && keepAlive) {
				socket.removeEventListener("error", handler);
				socket.removeEventListener("close", handler);
			}

			if (timer.current) {
				clearTimeout(timer.current);
			}
		};
	}, [handler, keepAlive, socket]);
};

function generateInterval(k) {
	var maxInterval = (Math.pow(2, k) - 1) * 1000;

	if (maxInterval > 15 * 1000) {
		maxInterval = 15 * 1000; // If the generated interval is more than 15 seconds, truncate it down to 15 seconds.
	}

	// generate the interval to a random number between 0 and the maxInterval determined from above
	return Math.random() * maxInterval;
}

export default useSocketKeepAlive;
