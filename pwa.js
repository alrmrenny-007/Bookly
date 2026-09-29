// Registers the service worker and offers a custom install button.
// Falls back to on-screen instructions on iOS, which has no install prompt API.

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  document.querySelectorAll(".install-btn").forEach((el) => (el.hidden = false));
});

window.addEventListener("appinstalled", () => {
  document.querySelectorAll(".install-btn, .ios-install-tip").forEach((el) => (el.hidden = true));
});

// Wires up any element with class "install-btn" already in the page markup.
// Buttons stay hidden until the browser confirms installability, or we
// swap in iOS instructions since Safari never fires beforeinstallprompt.
function mountInstallPrompt() {
  if (isStandalone()) return; // already installed, nothing to offer

  document.querySelectorAll(".install-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      btn.hidden = true;
    });
  });

  if (isIOS()) {
    document.querySelectorAll(".ios-install-tip").forEach((el) => (el.hidden = false));
  }
}

// Plays the one-shot boot animation when the site is launched from the
// installed home-screen icon, then removes the overlay for good.
function playInstalledLaunchAnimation() {
  if (!isStandalone()) return;
  const splash = document.getElementById("splash");
  if (!splash) return;
  document.documentElement.classList.add("is-installed-launch");
  splash.addEventListener("animationend", (e) => {
    if (e.animationName === "splashIris") splash.remove();
  });
}
