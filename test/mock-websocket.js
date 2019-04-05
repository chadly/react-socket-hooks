import Emitter from "eventemitter3";

export default function() {
	beforeEach(function() {
		let sockets = (this.sockets = []);

		global.WebSocket = class WebSocket extends Emitter {
			constructor(url, opts) {
				super();
				sockets.push(this);
			}

			static CONNECTING = 0;
			static OPEN = 1;
			static CLOSING = 2;
			static CLOSED = 3;

			readyState = this.CONNECTING;
			sentMessages = [];

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
			triggerMessage(message) {
				this.emit("message", { data: JSON.stringify(message) });
			}
		};
	});

	afterEach(function() {
		delete global.WebSocket;
		this.sockets = [];
	});
}
