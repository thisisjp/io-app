/**
 * This file contains all the JS scripts used by the MarkdownViewer component.
 */

export const ADD_MESSAGE_LISTENER_SCRIPT = `
function onMessage(event) {
  alert("On message");
}

function addMessageHandler() {
  if (document.hasOwnProperty('addEventListener')) {
    alert("Document has addEventListener");
    document.addEventListener("message", onMessage, false);
  } else if (window.hasOwnProperty('addEventListener')) {
    alert("Window has addEventListener");
    window.addEventListener("message", onMessage, false);
  } else {
    alert("No way to add message handler");
  }
}

setTimeout(addMessageHandler, 0);
`;

// Script to check window object
export const CHECK_POSTMESSAGE_SCRIPT = `


function internalPostMessage(message) {
  if (document.hasOwnProperty('postMessage')) {
    setTimeout(function() {
      window.postMessage(message);
    }, 500);
  } else if (window.hasOwnProperty('postMessage')) {
    setTimeout(function() {
      window.postMessage(message);
    }, 500);
  } else {
    alert("No way to post message");
  }
}

const message = JSON.stringify({
  type: "RESIZE_MESSAGE",
  payload: {
    height: document.body.scrollHeight
  }
});
internalPostMessage(message);
`;

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
