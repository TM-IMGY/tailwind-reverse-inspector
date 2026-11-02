import ExtPay from "extpay";

// This id must match the extension slug registered at https://extensionpay.com
// (create the extension there first, then put its exact id string here).
const extpay = ExtPay("tailwind-reverse-inspector");
extpay.startBackground();

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content-script.js"],
    });
  } catch (err) {
    // Fails on chrome:// pages, the Chrome Web Store, PDF viewer, etc. — expected, not actionable.
    console.warn("Tailwind Reverse Inspector: cannot inject on this page.", err);
  }
});

type Message =
  | { type: "GET_LICENSE_STATUS" }
  | { type: "OPEN_PAYMENT_PAGE" }
  | { type: "OPEN_TRIAL_PAGE" };

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  if (message?.type === "GET_LICENSE_STATUS") {
    extpay
      .getUser()
      .then((user) => sendResponse({ paid: Boolean(user.paid) }))
      .catch(() => sendResponse({ paid: false }));
    return true; // keep the message channel open for the async response
  }
  if (message?.type === "OPEN_PAYMENT_PAGE") {
    extpay.openPaymentPage();
    sendResponse({ ok: true });
    return false;
  }
  if (message?.type === "OPEN_TRIAL_PAGE") {
    extpay.openTrialPage();
    sendResponse({ ok: true });
    return false;
  }
  return false;
});
