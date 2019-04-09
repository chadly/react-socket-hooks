import { expect } from "chai";
import behavesLikeBrowser from "./behaves-like-browser";
import mockWebSocket from "./mock-websocket";
import { renderHook, cleanup, act } from "react-hooks-testing-library";

import { useSocket } from "../src";
import waitForSocket from "./wait-for-socket";

describe("Using sockets", function() {
	afterEach(cleanup);
	behavesLikeBrowser();
	mockWebSocket();

	describe("when rendering a socket hook", function() {
		let result, rerender;

		beforeEach(function() {
			const r = renderHook(({ url }) => useSocket(url), {
				initialProps: { url: "wss://api.example.com/" }
			});
			result = r.result;
			rerender = r.rerender;
		});

		it("should expose a send callback", function() {
			expect(result.current.send).to.be.a("function");
		});

		describe("and then sending a message on an open socket", function() {
			waitForSocket();

			beforeEach(function() {
				act(() => {
					this.ensureSingleSocket().triggerOpen();
					result.current.send({ bart: "beauvoir" });
				});
			});

			it("should send the message on the socket", function() {
				expect(this.ensureSingleSocket().sentMessages[0]).to.equal(
					'{"bart":"beauvoir"}'
				);
			});
		});

		describe("and then sending a message on a not-yet-open socket", function() {
			waitForSocket();

			beforeEach(function() {
				act(() => {
					result.current.send({ homer: "simpson" });
					result.current.send({ bart: "beauvoir" });
				});
			});

			it("should not send messages on the socket", function() {
				expect(this.ensureSingleSocket().sentMessages).to.be.empty;
			});

			describe("and then opening the socket", function() {
				beforeEach(function() {
					act(() => {
						this.ensureSingleSocket().triggerOpen();
					});
				});

				it("should send queued messages on the socket", function() {
					const socket = this.ensureSingleSocket();
					expect(socket.sentMessages).to.have.lengthOf(2);
					expect(socket.sentMessages[0]).to.equal('{"homer":"simpson"}');
					expect(socket.sentMessages[1]).to.equal('{"bart":"beauvoir"}');
				});

				describe("and then closing & reopening the socket", function() {
					beforeEach(function() {
						this.ensureSingleSocket().sentMessages = [];

						act(() => {
							this.ensureSingleSocket().triggerClose();
							this.ensureSingleSocket().triggerOpen();
						});
					});

					it("should not send duplicate messages on the socket", function() {
						expect(this.ensureSingleSocket().sentMessages).to.be.empty;
					});
				});
			});
		});

		describe("and then changing the url before the socket is initialized", function() {
			beforeEach(function() {
				act(() => {
					rerender({ url: "wss://testing.example.com/" });
				});
			});

			waitForSocket();

			it("should only open one socket with the new URL", function() {
				expect(this.ensureSingleSocket().url).to.equal(
					"wss://testing.example.com/"
				);
			});
		});

		describe("and then changing the url after the socket is initialized", function() {
			waitForSocket();

			beforeEach(function() {
				act(() => {
					rerender({ url: "wss://testing.example.com/" });
				});
			});

			waitForSocket();

			it("should close current socket and open new one", function() {
				expect(this.sockets).to.have.lengthOf(2);

				expect(this.sockets[0].url).to.equal("wss://api.example.com/");
				expect(this.sockets[0].readyState).to.equal(global.WebSocket.CLOSED);

				expect(this.sockets[1].url).to.equal("wss://testing.example.com/");
				expect(this.sockets[1].readyState).to.equal(
					global.WebSocket.CONNECTING
				);
			});

			describe("and then sending messages", function() {
				let socket;

				beforeEach(function() {
					act(() => {
						result.current.send({ homer: "simpson" });
						result.current.send({ bart: "beauvoir" });

						socket = this.sockets[1];
						socket.triggerOpen();
					});
				});

				it("should send the messages on the socket", function() {
					expect(socket.sentMessages).to.have.lengthOf(2);
					expect(socket.sentMessages[0]).to.equal('{"homer":"simpson"}');
					expect(socket.sentMessages[1]).to.equal('{"bart":"beauvoir"}');
				});
			});
		});
	});

	describe("when rendering a socket hook with a message handler", function() {
		let socketSink;

		beforeEach(function() {
			renderHook(() =>
				useSocket("wss://api.example.com/", {
					onMessage: message => {
						socketSink = message;
					}
				})
			);
		});

		describe("and then receiving a message", function() {
			waitForSocket();

			beforeEach(function() {
				act(() => {
					this.ensureSingleSocket().triggerMessage({ foo: "bar" });
				});
			});

			it("should call `onMessage` handler", function() {
				expect(socketSink).to.deep.equal({ foo: "bar" });
			});
		});
	});

	describe("when rendering a socket hook with no URL", function() {
		beforeEach(function() {
			renderHook(() => useSocket());
		});

		waitForSocket();

		it("should not initialize any socket", function() {
			expect(this.sockets).to.be.empty;
		});
	});
});
