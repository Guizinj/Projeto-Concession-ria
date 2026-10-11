import { test } from "node:test";
import assert from "node:assert/strict";
import { orderedImages } from "../js/gallery-images.js";

test("fotos seguem ordem estável, preservando o array original e descartando duplicatas", () => {
  const images = [
    { id: "c", storage_path: "carro/dentro.jpg", ordem: 2 },
    { id: "b", storage_path: "carro/lado.jpg", ordem: 1 },
    { id: "a", storage_path: "carro/frente.jpg", ordem: 0, principal: true },
    { id: "d", storage_path: "carro/frente.jpg", ordem: 3 },
    null, {},
  ];
  assert.deepEqual(orderedImages(images).map(image => image.id), ["a", "b", "c"]);
  assert.equal(images[0].id, "c");
  assert.deepEqual(orderedImages(null), []);
  assert.deepEqual(orderedImages([{ id: "b", url: "b.jpg", ordem: 1 }, { id: "a", url: "a.jpg", ordem: 1 }]).map(image => image.id), ["a", "b"]);
});
