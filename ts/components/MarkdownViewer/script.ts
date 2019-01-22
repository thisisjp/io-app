/**
 * This file contains all the JS scripts used by the MarkdownViewer component.
 */

// Script to notify the height of the body to the react WebView component
export const NOTIFY_BODY_HEIGHT_SCRIPT = `
function waitForBridge() {
  alert("Waiting for bridge");
  if (window.postMessage.length !== 1) {
    setTimeout(waitForBridge, 50);
  } else {
    alert("I am ready");
    const maxHeight = Math.max(
      0,
      document.documentElement.clientHeight,
      document.body.clientHeight
    );
    const message = JSON.stringify({
      type: "RESIZE_MESSAGE",
      payload: {
        height: maxHeight
      }
    });
    // Some devices (iOS) need the height immediately, others
    // (Android 9.0) need to receive it a tick later.
    window.postMessage(message);
    setTimeout(() => window.postMessage(message), 0);
  }
}

waitForBridge();
`;

export const NOTIFY_DOCUMENT_HEIGHT_SCRIPT = `
function onMessage(event) {
  const message = JSON.stringify({
    type: "RESIZE_MESSAGE",
    payload: {
      height: document.body.scrollHeight
    }
  });
  if (document.hasOwnProperty('postMessage')) {
    document.postMessage(message, '*');
  } else if (window.hasOwnProperty('postMessage')) {
    window.postMessage(message, '*');
  } else {
    alert("No way to notify you!");
  }
}

document.addEventListener("message", onMessage, false);
`;

// Javascript to detect link click and generate window message for internal links
export const NOTIFY_INTERNAL_LINK_CLICK_SCRIPT = `
const IO_INTERNAL_LINK_PREFIX = "ioit://";

function findParent(tagname, el) {
  while (el) {
    if ((el.nodeName || el.tagName).toLowerCase() === tagname.toLowerCase()) {
      return el;
    }
    el = el.parentNode;
  }
  return null;
}

document.body.onclick = function(e) {
  e = e || event;
  const from = findParent("a", e.target || e.srcElement);
  if (from) {
    const href = from.href;
    if (href.startsWith(IO_INTERNAL_LINK_PREFIX)) {
      const message = {
        type: "LINK_MESSAGE",
        payload: {
          href
        }
      };
      window.postMessage(JSON.stringify(message));
      return false;
    }
  }
};
`;
