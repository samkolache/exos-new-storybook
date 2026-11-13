// Simple password screen for the hosted Storybook. Loaded by manager-head.html
// and preview-head.html, so the whole UI and direct story links are covered.
//
// This is a light gate, not real security: it runs in the browser and the
// built files are still public. It stores only a SHA-256 hash of the password.
// To change the password, replace HASH with the SHA-256 of the new one:
//   printf '%s' 'new-password' | shasum -a 256
(function () {
  var HASH = 'a0fc7dbfa96283c418e24ac406f3fe1a0d8b17a88c05c0b03f65fcfeca041781';
  var KEY = 'exos-storybook-unlocked';

  // Only on the hosted site: local Storybook and the test runner stay open.
  var host = location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host.endsWith('.localhost')) return;

  try {
    if (localStorage.getItem(KEY) === HASH) return;
  } catch (e) {
    /* storage blocked: ask every time */
  }

  // Hide the page until it's unlocked, so nothing flashes behind the modal.
  var hide = document.createElement('style');
  hide.id = 'exos-gate-hide';
  hide.textContent = 'body > *:not(#exos-gate) { visibility: hidden !important; }';
  document.head.appendChild(hide);

  function sha256(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.from(new Uint8Array(buf))
        .map(function (b) { return b.toString(16).padStart(2, '0'); })
        .join('');
    });
  }

  function show() {
    var gate = document.createElement('div');
    gate.id = 'exos-gate';
    gate.innerHTML =
      '<form role="dialog" aria-modal="true" aria-labelledby="exos-gate-title">' +
      '<h1 id="exos-gate-title">Exos design system</h1>' +
      '<p>Enter the password to continue.</p>' +
      '<label for="exos-gate-input">Password</label>' +
      '<input id="exos-gate-input" type="password" autocomplete="current-password" required />' +
      '<p id="exos-gate-error" role="alert"></p>' +
      '<button type="submit">Continue</button>' +
      '</form>';

    var css = document.createElement('style');
    css.textContent =
      '#exos-gate { position: fixed; inset: 0; z-index: 2147483647; display: flex; align-items: center; justify-content: center; padding: 16px;' +
      ' background: #F4F6FA; font-family: Geist, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #0F121A; }' +
      '#exos-gate form { width: 100%; max-width: 360px; padding: 24px; background: #fff; border: 1px solid #E6EAF1; border-radius: 24px;' +
      ' box-shadow: 0 8px 24px rgba(15, 18, 26, 0.08); }' +
      '#exos-gate h1 { margin: 0 0 4px; font-family: Raleway, Geist, system-ui, sans-serif; font-size: 24px; line-height: 32px; font-weight: 700; letter-spacing: -0.01em; }' +
      '#exos-gate p { margin: 0 0 24px; font-size: 14px; line-height: 20px; color: #5B6475; }' +
      '#exos-gate label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; }' +
      '#exos-gate input { box-sizing: border-box; width: 100%; height: 44px; padding: 0 16px; font: inherit; font-size: 16px; color: inherit;' +
      ' border: 1.5px solid #D5DBE5; border-radius: 14px; outline: none; }' +
      '#exos-gate input:focus { border-color: #2B67EE; box-shadow: 0 0 0 4px rgba(61, 134, 255, 0.4); }' +
      '#exos-gate input[aria-invalid="true"] { border-color: #D93436; }' +
      '#exos-gate #exos-gate-error { min-height: 20px; margin: 8px 0 16px; color: #A11E24; }' +
      '#exos-gate button { width: 100%; height: 44px; font: inherit; font-size: 16px; font-weight: 600; color: #fff; background: #0F121A;' +
      ' border: 0; border-radius: 999px; cursor: pointer; }' +
      '#exos-gate button:hover { background: #1C1F26; }' +
      '#exos-gate button:focus-visible { outline: 2px solid #2B67EE; outline-offset: 2px; }';

    document.head.appendChild(css);
    document.body.appendChild(gate);

    var form = gate.querySelector('form');
    var input = gate.querySelector('input');
    var error = gate.querySelector('#exos-gate-error');
    input.focus();

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!window.crypto || !crypto.subtle) {
        // Browsers only allow hashing on https pages.
        error.textContent = 'Open this page over https to sign in.';
        return;
      }
      sha256(input.value).then(function (hash) {
        if (hash === HASH) {
          try { localStorage.setItem(KEY, HASH); } catch (e) { /* ignore */ }
          gate.remove();
          css.remove();
          hide.remove();
        } else {
          error.textContent = 'That password isn’t right. Try again.';
          input.setAttribute('aria-invalid', 'true');
          input.select();
        }
      });
    });
  }

  if (document.body) show();
  else document.addEventListener('DOMContentLoaded', show);
})();
