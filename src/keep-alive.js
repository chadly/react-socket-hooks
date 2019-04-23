import { useCallback, useEffect, useRef } from "react";

const useSocketKeepAlive = ({
	socket,
	keepAlive,
	keepAliveMaxDelay,
	keepAliveAttempts: attempts,
	setKeepAliveAttempts: setAttempts
}) => {
	const timer = useRef(null);

	const handler = useCallback(() => {
		const time = generateBackOffDelay(attempts, keepAliveMaxDelay);

		timer.current = setTimeout(() => {
			setAttempts(c => c + 1);
		}, time);
	}, [attempts, setAttempts, keepAliveMaxDelay]);

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

function generateBackOffDelay(k, max) {
	let backoff = Math.pow(2, k) * 1000;
	const jitter = Math.random() * 2000;

	if (k % 2 === 0) {
		backoff += jitter;
	} else {
		backoff -= jitter;
	}

	if (backoff > max) {
		backoff = max - jitter;
	}

	if (backoff < 0) {
		backoff = 0;
	}

	return Math.floor(backoff);
}

export default useSocketKeepAlive;
