import React, { createContext, useContext } from "react";
import useSocketRegistry from "./registry";

const SocketScopeContext = createContext();

export const useAcquireSocket = () => {
	const { acquire } = useContext(SocketScopeContext) || {};
	return acquire;
};

export const useReleaseSocket = () => {
	const { release } = useContext(SocketScopeContext) || {};
	return release;
};

export const Provider = ({ socketDelay, children }) => {
	const ctx = useSocketRegistry(socketDelay);

	return (
		<SocketScopeContext.Provider value={ctx}>
			{children}
		</SocketScopeContext.Provider>
	);
};
