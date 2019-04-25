import { useFakeTimers } from "sinon";

export default function() {
	beforeEach(function() {
		this.clock = useFakeTimers();
	});

	afterEach(function() {
		this.clock.restore();
	});
}
