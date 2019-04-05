import { expect } from "chai";
import behavesLikeBrowser from "./behaves-like-browser";
import mockWebSocket from "./mock-websocket";
import { renderHook, cleanup, act } from "react-hooks-testing-library";

import { useSocket } from "../src";

describe("When rendering a component with useSocket", function() {
	afterEach(cleanup);
	behavesLikeBrowser();
	mockWebSocket();

	beforeEach(function() {
		this.ensureSingleSocket = () => {
			expect(this.sockets).to.have.lengthOf(1);
			return this.sockets[0];
		};
	});

	it("should expose a send callback which sends on the socket", function() {
		const { result } = renderHook(() =>
			useSocket("http://example.com/api/bananas/", {
				onMessage: Function.prototype
			})
		);

		expect(result.current.send).to.be.a("function");

		act(() => {
			this.ensureSingleSocket().triggerOpen();
			result.current.send({ bart: "beauvoir" });
		});

		expect(this.ensureSingleSocket().sentMessages[0]).to.equal(
			'{"bart":"beauvoir"}'
		);
	});

	it("should call `onMessage` when message received on socket", function() {
		let socketSink;
		renderHook(() =>
			useSocket("http://example.com/api/bananas/", {
				onMessage: message => {
					socketSink = message;
				}
			})
		);

		act(() => {
			this.ensureSingleSocket().triggerMessage({ foo: "bar" });
		});

		expect(socketSink).to.deep.equal({ foo: "bar" });
	});

	it("should queue messages when socket is not yet open", function() {
		const { result } = renderHook(() =>
			useSocket("http://example.com/api/bananas/")
		);
		act(() => {
			result.current.send({ homer: "simpson" });
		});

		expect(this.ensureSingleSocket().sentMessages).to.be.empty;
	});

	it("should send queued messages once socket opens", function() {
		const { result } = renderHook(() =>
			useSocket("http://example.com/api/bananas/")
		);

		act(() => {
			result.current.send({ homer: "simpson" });
			result.current.send({ bart: "beauvoir" });

			this.ensureSingleSocket().triggerOpen();
		});

		const socket = this.ensureSingleSocket();
		expect(socket.sentMessages).to.have.lengthOf(2);
		expect(socket.sentMessages[0]).to.equal('{"homer":"simpson"}');
		expect(socket.sentMessages[1]).to.equal('{"bart":"beauvoir"}');
	});
});
