import { test } from "node:test";
import assert from "node:assert/strict";
import { createExploreQueue } from "../js/explore-queue.js";
import { swipeDirection } from "../js/explore-gesture.js";

const batch = (start, count, temMais) => ({ veiculos: Array.from({ length: count }, (_, i) => ({ id: start + i })), temMais, proximoOffset: temMais ? start + count : null });

test("Explorar carrega quatro metadados, avança sem rede e volta após o fim", async () => {
  const calls = [];
  const queue = createExploreQueue(async ({ offset }) => { calls.push(offset); return offset === 0 ? batch(0, 4, true) : batch(4, 2, false); });
  await queue.next();
  assert.equal(queue.snapshot().current.id, 0);
  assert.equal(queue.snapshot().next.id, 1);
  assert.equal(queue.previous(), false);
  for (let i = 1; i <= 5; i++) { await queue.next(); assert.equal(queue.snapshot().current.id, i); }
  assert.deepEqual(calls, [0, 4]);
  await queue.next();
  assert.equal(queue.snapshot().ended, true);
  assert.equal(queue.previous(), true);
  assert.equal(queue.snapshot().current.id, 5);
  assert.equal(queue.snapshot().ended, false);
  queue.previous();
  assert.equal(queue.snapshot().current.id, 4);
  await queue.restart();
  assert.equal(queue.snapshot().current.id, 0);
  assert.deepEqual(calls, [0, 4, 0]);
});

test("cliques concorrentes não duplicam lotes; falha conserva posição e offset", async () => {
  let finish, count = 0, fail = false;
  const calls = [];
  const queue = createExploreQueue(({ offset }) => {
    calls.push(offset); count++;
    if (fail) return Promise.reject(new Error("rede"));
    return new Promise(resolve => { finish = () => resolve(batch(offset, 4, true)); });
  });
  const first = queue.next();
  assert.equal(await queue.next(), false);
  assert.equal(queue.previous(), false);
  assert.equal(count, 1);
  finish(); await first;
  await queue.next(); await queue.next(); await queue.next();
  fail = true;
  await assert.rejects(queue.next(), /rede/);
  assert.equal(queue.snapshot().current.id, 3);
  assert.equal(queue.snapshot().pending, false);
  fail = false;
  const retry = queue.next(); finish(); await retry;
  assert.equal(queue.snapshot().current.id, 4);
  assert.deepEqual(calls, [0, 4, 4]);
});

test("cancelamento descarta respostas tardias mesmo quando a rede ignora o signal", async () => {
  const replies = [], signals = [];
  const queue = createExploreQueue(({ signal }) => { signals.push(signal); return new Promise(resolve => replies.push(resolve)); });
  const old = queue.next();
  const fresh = queue.restart();
  assert.equal(signals[0].aborted, true);
  replies[1](batch(10, 2, false)); await fresh;
  replies[0](batch(0, 4, true)); assert.equal(await old, false);
  assert.equal(queue.snapshot().current.id, 10);
  assert.equal(queue.snapshot().loaded, 2);
});

test("vazio é fim válido; cancelamento não é erro", async () => {
  const empty = createExploreQueue(async () => batch(0, 0, false));
  await empty.next();
  assert.equal(empty.snapshot().ended, true);
  assert.equal(empty.snapshot().current, null);
  const queue = createExploreQueue(({ signal }) => new Promise((_, reject) => signal.addEventListener("abort", () => reject(new DOMException("cancelado", "AbortError")))));
  const request = queue.next(); queue.stop();
  assert.equal(await request, false);
  assert.equal(queue.snapshot().pending, false);
});

test("gestos exigem distância e direção horizontal; toque, vertical e arrasto lento não navegam", () => {
  const gesture = { dx: -80, dy: 4, duration: 200, width: 360 };
  assert.equal(swipeDirection(gesture), 1);
  assert.equal(swipeDirection({ ...gesture, dx: 80 }), -1);
  for (const values of [{ dx: 20 }, { dy: 90 }, { duration: 1800 }, { dx: -60, width: 1440 }]) assert.equal(swipeDirection({ ...gesture, ...values }), 0);
});
