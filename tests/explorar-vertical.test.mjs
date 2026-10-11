import { test } from "node:test";
import assert from "node:assert/strict";
import { verticalSwipeDirection } from "../js/explore-vertical-gesture.js";

test("swipe vertical distingue próximo/anterior de toque ou gesto horizontal", () => {
  const gesture = { dx: 4, dy: -100, duration: 200, height: 748 };
  assert.equal(verticalSwipeDirection(gesture), 1);
  assert.equal(verticalSwipeDirection({ ...gesture, dy: 100 }), -1);
  for (const change of [{ dy: 20 }, { dx: 120 }, { duration: 1500 }, { height: 0 }, { dy: NaN }]) assert.equal(verticalSwipeDirection({ ...gesture, ...change }), 0);
});
