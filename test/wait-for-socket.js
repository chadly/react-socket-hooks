import { DELAY } from "../src/socket-instance";

export default function waitForSocket() {
	beforeEach(function(done) {
		setTimeout(done, DELAY + 10);
	});
}
