// Declarative content script injected only on https://extensionpay.com/* (see manifest.json).
// Importing "extpay" here runs its built-in window.postMessage relay, which forwards the
// "payment succeeded" / "trial started" signal from the ExtensionPay checkout page back to
// this extension's background service worker. Required by ExtensionPay's own integration
// contract — see https://extensionpay.com/docs
import "extpay";
