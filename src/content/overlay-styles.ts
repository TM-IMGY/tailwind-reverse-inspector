// Plain hand-written CSS for the overlay UI, injected into its shadow root.
// Deliberately not Tailwind — this is the tool's own chrome, isolated from
// both the host page's styles and from Tailwind itself.
export const OVERLAY_CSS = `
:host {
  all: initial;
}
* {
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.tw-ri-highlight {
  position: fixed;
  pointer-events: none;
  background: rgba(14, 165, 233, 0.18);
  border: 1.5px solid rgb(14, 165, 233);
  border-radius: 2px;
  z-index: 2147483000;
  transition: all 60ms ease-out;
}
.tw-ri-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 340px;
  max-height: 70vh;
  overflow-y: auto;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
  z-index: 2147483001;
  font-size: 13px;
  line-height: 1.5;
}
.tw-ri-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #1e293b;
  font-weight: 600;
}
.tw-ri-close {
  cursor: pointer;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 16px;
  line-height: 1;
  padding: 4px;
}
.tw-ri-close:hover {
  color: #e2e8f0;
}
.tw-ri-body {
  padding: 14px;
}
.tw-ri-hint {
  color: #94a3b8;
}
.tw-ri-tag {
  display: inline-block;
  background: #1e293b;
  color: #38bdf8;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  margin-bottom: 8px;
}
.tw-ri-classes {
  background: #1e293b;
  border-radius: 6px;
  padding: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  word-break: break-word;
  user-select: text;
}
.tw-ri-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.tw-ri-btn {
  cursor: pointer;
  border: none;
  border-radius: 6px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
}
.tw-ri-btn-primary {
  background: #0ea5e9;
  color: #fff;
}
.tw-ri-btn-primary:hover {
  background: #0284c7;
}
.tw-ri-btn-secondary {
  background: #1e293b;
  color: #e2e8f0;
}
.tw-ri-btn-secondary:hover {
  background: #334155;
}
.tw-ri-upgrade {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #1e293b;
}
.tw-ri-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  letter-spacing: 0.04em;
}
.tw-ri-badge-free {
  background: #334155;
  color: #cbd5e1;
}
.tw-ri-badge-pro {
  background: #0ea5e9;
  color: #fff;
}
`;
