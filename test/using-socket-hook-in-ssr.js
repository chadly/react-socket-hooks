import { expect } from "chai";
import { renderHook, cleanup } from "react-hooks-testing-library";
import behavesLikeBrowser from "./behaves-like-browser";
import mockTimers from "./mock-timers";
import { useSocket } from "../src";

describe("Using socket hook in server-side rendering", function() {
	afterEach(cleanup);
	behavesLikeBrowser();
	mockTimers();

	describe("when rendering a socket hook in a non-browser environment", function() {
		let result;

		beforeEach(function() {
			const r = renderHook(({ url }) => useSocket(url), {
				initialProps: { url: "wss://api.example.com/" }
			});
			result = r.result;
			this.clock.tick(1000);
		});

		it("should expose a send callback", function() {
			expect(result.current.send).to.be.a("function");
		});

		describe("when calling send callback on server", function() {
			it("should throw", function() {
				expect(result.current.send).to.throw();
			});
		});

		it("should return undefined ready state", function() {
			expect(result.current.readyState).to.be.undefined;
		});
	});
});
