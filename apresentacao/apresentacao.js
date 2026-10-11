"use strict";

const printButton = document.getElementById("print-presentation");
if (printButton) {
  printButton.hidden = false;
  printButton.addEventListener("click", () => window.print());
}
