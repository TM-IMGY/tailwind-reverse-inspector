import { useCallback, useEffect, useState } from "react";
import { generateTailwindClasses, type InspectResult } from "../lib/css-to-tailwind";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function rectFromElement(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function App({ shadowHost, onClose }: { shadowHost: HTMLElement; onClose: () => void }) {
  const [hoverRect, setHoverRect] = useState<Rect | null>(null);
  const [result, setResult] = useState<InspectResult | null>(null);
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_LICENSE_STATUS" }, (res) => {
      setIsPro(Boolean(res?.paid));
    });
  }, []);

  const isOwnUi = useCallback((target: EventTarget | null) => target instanceof Node && shadowHost.contains(target), [shadowHost]);

  useEffect(() => {
    function handleMouseOver(e: MouseEvent) {
      if (isOwnUi(e.target)) {
        setHoverRect(null);
        return;
      }
      const target = e.target as Element | null;
      if (!target) return;
      setHoverRect(rectFromElement(target));
    }

    function handleClick(e: MouseEvent) {
      if (isOwnUi(e.target)) return; // let clicks on our own panel behave normally
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as Element | null;
      if (!target) return;
      setResult(generateTailwindClasses(target));
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("mouseover", handleMouseOver, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("mouseover", handleMouseOver, true);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOwnUi, onClose]);

  const classesText = result
    ? [...result.basic, ...(isPro ? result.advanced : [])].join(" ")
    : "";

  const handleCopy = () => {
    if (!classesText) return;
    navigator.clipboard.writeText(classesText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleUpgrade = () => {
    chrome.runtime.sendMessage({ type: "OPEN_PAYMENT_PAGE" });
  };

  return (
    <>
      {hoverRect && !result && (
        <div
          className="tw-ri-highlight"
          style={{
            top: hoverRect.top,
            left: hoverRect.left,
            width: hoverRect.width,
            height: hoverRect.height,
          }}
        />
      )}
      <div className="tw-ri-panel">
        <div className="tw-ri-header">
          <span>Tailwind Reverse Inspector</span>
          <button className="tw-ri-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="tw-ri-body">
          {!result && <p className="tw-ri-hint">Click any element on the page to inspect it. Press Esc to close.</p>}

          {result && (
            <>
              <span className="tw-ri-tag">&lt;{result.tagName}&gt;</span>
              <div className="tw-ri-classes">{classesText || "(no matching utility classes)"}</div>
              {!isPro && result.advanced.length > 0 && (
                <p className="tw-ri-hint" style={{ marginTop: 8 }}>
                  +{result.advanced.length} more utilities (border, shadow, layout) available with Pro.
                </p>
              )}
              <div className="tw-ri-actions">
                <button className="tw-ri-btn tw-ri-btn-primary" onClick={handleCopy}>
                  {copied ? "Copied!" : "Copy classes"}
                </button>
                <button className="tw-ri-btn tw-ri-btn-secondary" onClick={() => setResult(null)}>
                  Pick another
                </button>
              </div>
            </>
          )}

          <div className="tw-ri-upgrade">
            <span className={`tw-ri-badge ${isPro ? "tw-ri-badge-pro" : "tw-ri-badge-free"}`}>
              {isPro ? "PRO" : "FREE"}
            </span>
            {!isPro && (
              <button
                className="tw-ri-btn tw-ri-btn-secondary"
                style={{ marginLeft: 8 }}
                onClick={handleUpgrade}
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
