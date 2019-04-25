import Emitter from "eventemitter3";
import { expect } from "chai";

export default function() {
	beforeEach(function() {
		let sockets = (this.sockets = []);

		global.WebSocket = class WebSocket extends Emitter {
			constructor(url) {
				super();

				this.url = url;
				this.readyState = WebSocket.CONNECTING;
				this.sentMessages = [];

				sockets.push(this);
			}

			static CONNECTING = 0;
			static OPEN = 1;
			static CLOSING = 2;
			static CLOSED = 3;

			close() {
				this.readyState = WebSocket.CLOSED;
			}

			send(message) {
				this.sentMessages.push(message);
			}

			addEventListener(...args) {
				this.addListener(...args);
			}

			removeEventListener(...args) {
				this.removeListener(...args);
			}

			triggerOpen() {
				this.readyState = WebSocket.OPEN;
				this.emit("open");
			}

			triggerClose() {
				this.readyState = WebSocket.CLOSED;
				this.emit("close");
			}

			triggerError() {
				this.readyState = WebSocket.CLOSED;
				this.emit("error");
			}

			triggerMessage(message) {
				this.emit("message", { data: JSON.stringify(message) });
			}
		};
	});

	beforeEach(function() {
		this.ensureSingleSocket = () => {
			expect(this.sockets).to.have.lengthOf(1);
			return this.sockets[0];
		};
	});

	afterEach(function() {
		delete global.WebSocket;
		this.sockets = [];
	});
}
