import { expect } from "chai";
import behavesLikeBrowser from "./behaves-like-browser";
import mockWebSocket from "./mock-websocket";
import { render, cleanup, act } from "react-testing-library";

import React, { useState } from "react";

import { useSocket, SocketScope } from "../src";

const FAKE_URL1 = "wss://api.example.com/1";
const FAKE_URL2 = "wss://api.example.com/2";

const MySocket = ({ url, handler }) => {
	useSocket(url, { onMessage: handler });
	return <span>ohhai</span>;
};

describe("Using scoped sockets", function() {
	afterEach(cleanup);
	behavesLikeBrowser();
	mockWebSocket();

	describe("when rendering multiple socket hooks within one scope", function() {
		beforeEach(function() {
			const App = () => {
				const [url1, setUrl1] = useState("");
				const [url2, setUrl2] = useState("");
				const [url3, setUrl3] = useState("");

				this.setUrl1 = setUrl1;
				this.setUrl2 = setUrl2;
				this.setUrl3 = setUrl3;

				return (
					<SocketScope>
						<MySocket
							url={url1}
							handler={msg => {
								this.result1 = msg;
							}}
						/>
						<MySocket
							url={url2}
							handler={msg => {
								this.result2 = msg;
							}}
						/>
						<MySocket
							url={url3}
							handler={msg => {
								this.result3 = msg;
							}}
						/>
					</SocketScope>
				);
			};

			render(<App />);
		});

		it("should not open any socket connections", function() {
			expect(this.sockets).to.be.empty;
		});

		describe("with the same URL", function() {
			beforeEach(function() {
				act(() => {
					this.setUrl1(FAKE_URL1);
					this.setUrl2(FAKE_URL1);
					this.setUrl3(FAKE_URL1);
				});
			});

			it("should only open one socket connection", function() {
				const s = this.ensureSingleSocket();
				expect(s.url).to.equal(FAKE_URL1);
			});

			describe("and then receiving a socket message", function() {
				beforeEach(function() {
					act(() => {
						this.sockets[0].triggerMessage({ hello: "world" });
					});
				});

				it("should run callback handler for all socket hooks", function() {
					expect(this.result1).to.deep.equal({ hello: "world" });
					expect(this.result2).to.deep.equal({ hello: "world" });
					expect(this.result3).to.deep.equal({ hello: "world" });
				});
			});

			describe("and then disabling all but one socket hook", function() {
				beforeEach(function() {
					act(() => {
						this.setUrl2("");
						this.setUrl3("");
					});
				});

				it("should not close socket", function() {
					const socket = this.ensureSingleSocket();
					expect(socket.readyState).to.equal(global.WebSocket.CONNECTING);
				});
			});

			describe("and then disabling all socket hooks", function() {
				beforeEach(function() {
					act(() => {
						this.setUrl1("");
						this.setUrl2("");
						this.setUrl3("");
					});
				});

				it("should close the socket", function() {
					const socket = this.ensureSingleSocket();
					expect(socket.readyState).to.equal(global.WebSocket.CLOSED);
				});
			});
		});

		describe("with different URLs", function() {
			beforeEach(function() {
				act(() => {
					this.setUrl1(FAKE_URL1);
					this.setUrl2(FAKE_URL2);
					this.setUrl3(FAKE_URL2);
				});
			});

			it("should open multiple socket connections despite socket scope", function() {
				expect(this.sockets).to.have.lengthOf(2);

				expect(this.sockets[0].url).to.equal(FAKE_URL1);
				expect(this.sockets[1].url).to.equal(FAKE_URL2);
			});
		});
	});

	describe("when rendering multiple socket hooks from within multiple scopes", function() {
		beforeEach(function() {
			const App = () => (
				<>
					<SocketScope>
						<MySocket url={FAKE_URL1} />
						<MySocket url={FAKE_URL1} />
						<MySocket url={FAKE_URL1} />
					</SocketScope>
					<SocketScope>
						<MySocket url={FAKE_URL1} />
						<MySocket url={FAKE_URL2} />
						<MySocket url={FAKE_URL2} />
					</SocketScope>
				</>
			);

			render(<App />);
		});

		it("should open multiple socket connections", function() {
			expect(this.sockets).to.have.lengthOf(3);

			expect(this.sockets[0].url).to.equal(FAKE_URL1);
			expect(this.sockets[1].url).to.equal(FAKE_URL1);
			expect(this.sockets[2].url).to.equal(FAKE_URL2);
		});
	});

	describe("when rendering multiple socket hooks with no scopes", function() {
		beforeEach(function() {
			const App = () => (
				<>
					<MySocket url={FAKE_URL1} />
					<MySocket url={FAKE_URL1} />
					<MySocket url={FAKE_URL1} />
				</>
			);

			render(<App />);
		});

		it("should open multiple socket connections", function() {
			expect(this.sockets).to.have.lengthOf(3);

			expect(this.sockets[0].url).to.equal(FAKE_URL1);
			expect(this.sockets[1].url).to.equal(FAKE_URL1);
			expect(this.sockets[2].url).to.equal(FAKE_URL1);
		});
	});
});
