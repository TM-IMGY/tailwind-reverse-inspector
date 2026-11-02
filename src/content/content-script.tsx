import { createRoot } from "react-dom/client";
import { App } from "./App";
import { OVERLAY_CSS } from "./overlay-styles";

const HOST_ID = "tw-reverse-inspector-root";

function main() {
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    // Toolbar icon clicked again while open: close it.
    existing.remove();
    return;
  }

  const host = document.createElement("div");
  host.id = HOST_ID;
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const styleEl = document.createElement("style");
  styleEl.textContent = OVERLAY_CSS;
  shadow.appendChild(styleEl);

  const mountPoint = document.createElement("div");
  shadow.appendChild(mountPoint);

  const root = createRoot(mountPoint);
  root.render(<App shadowHost={host} onClose={() => host.remove()} />);
}

main();
