import test from "node:test";
import assert from "node:assert/strict";
import { mapEmbedUrl } from "../js/components/store-location.js";

test("iframe aceita somente a incorporação HTTPS do Google Maps, sem HTML ou outros destinos", () => {
  const expected = "https://www.google.com/maps/embed?pb=!1m2!1sDetroit%20Veiculos";
  assert.equal(mapEmbedUrl(expected), expected);
  for (const input of [null, "", '<iframe src="https://www.google.com/maps/embed?pb=local"></iframe>',
    "javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "http://www.google.com/maps/embed?pb=local",
    "https://evil.example/maps/embed?pb=local", "https://www.google.com.evil.example/maps/embed?pb=local",
    "https://www.google.com@evil.example/maps/embed?pb=local", "https://usuario:senha@www.google.com/maps/embed?pb=local",
    "https://www.google.com:8443/maps/embed?pb=local", "https://www.google.com/url?pb=local",
    "https://www.google.com/maps/embed", "https://www.google.com/maps/embed?pb=", "https://www.google.com/maps/embed?pb=a&pb=b",
    "https://www.google.com/maps/embed?pb=local&url=https://evil.example", "https://www.google.com/maps/embed?pb=local#script",
  ]) assert.equal(mapEmbedUrl(input), null, String(input));
});
