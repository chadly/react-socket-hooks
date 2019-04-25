import React, { useState } from "react";
import { expect } from "chai";
import behavesLikeBrowser from "./behaves-like-browser";
import mockWebSocket from "./mock-websocket";
import mockTimers from "./mock-timers";
import { renderHook, cleanup, act } from "react-hooks-testing-library";
import { render } from "react-testing-library";

import { useSocket, SocketScope } from "../src";

const KEEP_ALIVE_WAIT_TIME = 20000;

const MySocket = ({ keepAlive = true }) => {
	useSocket("wss://api.example.com/", { keepAlive });
	return <span>ohhai</span>;
};

describe("Using sockets with keep-alive option", function() {
	afterEach(cleanup);
	behavesLikeBrowser();
	mockWebSocket();
	mockTimers();

	describe("when rendering a socket hook with keep-alive option", function() {
		let result;

		beforeEach(function() {
			const r = renderHook(() =>
				useSocket("wss://api.example.com/", { keepAlive: true })
			);
			result = r.result;

			this.clock.tick(1000);
		});

		it("should return connection keep-alive attempt count", function() {
			expect(result.current.keepAliveAttempts).to.equal(0);
		});

		describe("and then getting disconnected", function() {
			beforeEach(function() {
				act(() => {
					const socket = this.ensureSingleSocket();
					socket.triggerOpen();
					socket.triggerClose();
				});
			});

			it("should return websocket state as closed", function() {
				expect(result.current.readyState).to.equal(global.WebSocket.CLOSED);
			});

			describe("and then waiting some time", function() {
				beforeEach(function() {
					this.clock.tick(KEEP_ALIVE_WAIT_TIME);
				});

				it("should increment keep-alive attempt count", function() {
					expect(result.current.keepAliveAttempts).to.equal(1);
				});

				it("should try to reopen websocket", function() {
					expect(result.current.readyState).to.equal(
						global.WebSocket.CONNECTING
					);
					expect(this.sockets).to.have.lengthOf(2);
				});

				describe("and then getting a socket error", function() {
					beforeEach(function() {
						this.sockets[1].triggerError();
					});

					it("should return websocket state as closed", function() {
						expect(result.current.readyState).to.equal(global.WebSocket.CLOSED);
					});

					describe("and then waiting some time", function() {
						beforeEach(function() {
							this.clock.tick(KEEP_ALIVE_WAIT_TIME);
						});

						it("should increment keep-alive attempt count", function() {
							expect(result.current.keepAliveAttempts).to.equal(2);
						});

						it("should try to reopen websocket", function() {
							expect(result.current.readyState).to.equal(
								global.WebSocket.CONNECTING
							);
							expect(this.sockets).to.have.lengthOf(3);
						});
					});
				});

				describe("and then reconnecting to the socket", function() {
					beforeEach(function() {
						this.sockets[1].triggerOpen();
					});

					it("should return websocket state as open", function() {
						expect(result.current.readyState).to.equal(global.WebSocket.OPEN);
					});

					describe("and then waiting some time", function() {
						beforeEach(function() {
							this.clock.tick(KEEP_ALIVE_WAIT_TIME);
						});

						it("should not increment keep-alive attempt count", function() {
							expect(result.current.keepAliveAttempts).to.equal(1);
						});

						it("should not try to reopen websocket", function() {
							expect(result.current.readyState).to.equal(global.WebSocket.OPEN);
							expect(this.sockets).to.have.lengthOf(2);
						});
					});
				});
			});
		});
	});

	describe("when rendering a socket hook without keep-alive option", function() {
		let result;

		beforeEach(function() {
			const r = renderHook(() =>
				useSocket("wss://api.example.com/", { keepAlive: false })
			);
			result = r.result;

			this.clock.tick(1000);
		});

		it("should return connection keep-alive attempt count", function() {
			expect(result.current.keepAliveAttempts).to.equal(0);
		});

		describe("and then getting disconnected", function() {
			beforeEach(function() {
				act(() => {
					const socket = this.ensureSingleSocket();
					socket.triggerOpen();
					socket.triggerClose();
				});
			});

			it("should return websocket state as closed", function() {
				expect(result.current.readyState).to.equal(global.WebSocket.CLOSED);
			});

			describe("and then waiting some time", function() {
				beforeEach(function() {
					this.clock.tick(KEEP_ALIVE_WAIT_TIME);
				});

				it("should not increment keep-alive attempt count", function() {
					expect(result.current.keepAliveAttempts).to.equal(0);
				});

				it("should not try to reopen websocket", function() {
					expect(result.current.readyState).to.equal(global.WebSocket.CLOSED);
					expect(this.sockets).to.have.lengthOf(1);
				});
			});
		});
	});

	describe("when rendering multiple socket hooks with keep-alive option within one scope", function() {
		beforeEach(function() {
			const App = () => {
				const [doIt, setDoIt] = useState(true);

				this.toggleSockets = () => setDoIt(t => !t);

				return (
					<SocketScope>
						{doIt ? (
							<>
								<MySocket />
								<MySocket />
								<MySocket />
							</>
						) : null}
					</SocketScope>
				);
			};

			render(<App />);

			this.clock.tick(1000);
		});

		it("should only open one socket connection", function() {
			const s = this.ensureSingleSocket();
			expect(s.url).to.equal("wss://api.example.com/");
		});

		describe("and then receiving a socket error", function() {
			beforeEach(function() {
				act(() => {
					const socket = this.ensureSingleSocket();
					socket.triggerError();
				});
			});

			it("should close the websocket", function() {
				expect(this.ensureSingleSocket().readyState).to.equal(
					global.WebSocket.CLOSED
				);
			});

			describe("and then waiting some time", function() {
				beforeEach(function() {
					this.clock.tick(KEEP_ALIVE_WAIT_TIME);
				});

				it("should try to reopen websocket", function() {
					expect(this.sockets).to.have.lengthOf(2);
					expect(this.sockets[1].readyState).to.equal(
						global.WebSocket.CONNECTING
					);
				});

				describe("and then derendering all socket hooks", function() {
					beforeEach(function() {
						this.toggleSockets();
						this.clock.tick(KEEP_ALIVE_WAIT_TIME);
					});

					it("should close all websockets", function() {
						expect(this.sockets).to.have.lengthOf(2);

						for (let i; i < this.sockets.length; i++) {
							expect(this.sockets[i].readyState).to.equal(
								global.WebSocket.CONNECTING
							);
						}
					});
				});
			});
		});
	});

	describe("when rendering multiple socket hooks without keep-alive option within one scope", function() {
		beforeEach(function() {
			const App = () => (
				<SocketScope>
					<MySocket keepAlive={false} />
					<MySocket keepAlive={false} />
					<MySocket keepAlive={false} />
				</SocketScope>
			);

			render(<App />);

			this.clock.tick(1000);
		});

		it("should only open one socket connection", function() {
			const s = this.ensureSingleSocket();
			expect(s.url).to.equal("wss://api.example.com/");
		});

		describe("and then receiving a socket error", function() {
			beforeEach(function() {
				act(() => {
					const socket = this.ensureSingleSocket();
					socket.triggerError();
				});
			});

			it("should close the websocket", function() {
				expect(this.ensureSingleSocket().readyState).to.equal(
					global.WebSocket.CLOSED
				);
			});

			describe("and then waiting some time", function() {
				beforeEach(function() {
					this.clock.tick(KEEP_ALIVE_WAIT_TIME);
				});

				it("should not try to reopen websocket", function() {
					expect(this.sockets).to.have.lengthOf(1);
					expect(this.sockets[0].readyState).to.equal(global.WebSocket.CLOSED);
				});
			});
		});
	});
});
