import { expect } from "chai";
import behavesLikeBrowser from "./behaves-like-browser";
import mockWebSocket from "./mock-websocket";
import mockTimers from "./mock-timers";
import { renderHook, cleanup, act } from "react-hooks-testing-library";

import useSocket from "../src";

const KEEP_ALIVE_WAIT_TIME = 20000;

describe("Using sockets with keep-alive option", function() {
	afterEach(cleanup);
	behavesLikeBrowser();
	mockWebSocket();
	mockTimers();

	describe("when rendering a socket hook with keep-alive option", function() {
		let result, socketSink;

		beforeEach(function() {
			socketSink = null;

			const r = renderHook(() => {
				const { useMessageHandler, ...result } = useSocket(
					"wss://api.example.com/",
					{
						keepAlive: true
					}
				);

				useMessageHandler(message => {
					socketSink = message;
				});

				return result;
			});
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

					describe("and then receiving a socket message", function() {
						beforeEach(function() {
							act(() => {
								this.sockets[1].triggerMessage({ foo: "bar" });
							});
						});

						it("should call `onMessage` handler", function() {
							expect(socketSink).to.deep.equal({ foo: "bar" });
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
});
