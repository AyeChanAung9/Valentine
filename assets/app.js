function getRoutes() {
  return Array.from(document.querySelectorAll("[data-route]")).map(
    (section) => section.dataset.route
  );
}

function showRoute(name) {
  const routes = getRoutes();
  routes.forEach((route) => {
    const section = document.querySelector(`[data-route="${route}"]`);
    if (!section) return;
    section.classList.toggle("active", route === name);
  });

  if (name.startsWith("final")) {
    launchFlowers();
  }
}

function handleHash() {
  const routes = getRoutes();
  const hash = window.location.hash.replace("#", "");
  if (routes.includes(hash)) {
    showRoute(hash);
  } else if (routes.length > 0) {
    showRoute(routes[0]);
  }
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function moveRunaway(button, boundary, yesButton) {
  const padding = 16;
  const bounds = boundary.getBoundingClientRect();
  const btnRect = button.getBoundingClientRect();
  const maxX = bounds.width - btnRect.width - padding;
  const maxY = bounds.height - btnRect.height - padding;
  const yesRect = yesButton ? yesButton.getBoundingClientRect() : null;

  let x = randomBetween(padding, Math.max(padding, maxX));
  let y = randomBetween(padding, Math.max(padding, maxY));

  if (yesRect) {
    const parentRect = boundary.getBoundingClientRect();
    const yesBox = {
      left: yesRect.left - parentRect.left - padding,
      right: yesRect.right - parentRect.left + padding,
      top: yesRect.top - parentRect.top - padding,
      bottom: yesRect.bottom - parentRect.top + padding,
    };

    let attempts = 0;
    while (
      x + btnRect.width > yesBox.left &&
      x < yesBox.right &&
      y + btnRect.height > yesBox.top &&
      y < yesBox.bottom &&
      attempts < 12
    ) {
      x = randomBetween(padding, Math.max(padding, maxX));
      y = randomBetween(padding, Math.max(padding, maxY));
      attempts += 1;
    }

    if (attempts >= 12) {
      const safeY = Math.min(
        Math.max(yesBox.bottom + padding, padding),
        Math.max(padding, maxY)
      );
      y = safeY;
    }
  }
  button.style.position = "absolute";
  button.style.left = `${x}px`;
  button.style.top = `${y}px`;
}

function setupRunaway() {
  const runaway = document.querySelector("[data-runaway]");
  if (!runaway) return;
  const maxEscapes = 6;
  let escapeCount = 0;
  let isStopped = false;

  const actions = runaway.parentElement;
  const card = runaway.closest(".card");
  const yesButton = actions.querySelector("[data-safe]");
  let boundary = actions;

  function applyBoundary() {
    const isMobile = window.matchMedia("(max-width: 520px)").matches;
    actions.style.position = "";
    actions.style.minHeight = "";
    if (card) {
      card.style.position = "";
    }

    if (isMobile && card) {
      boundary = card;
      boundary.style.position = "relative";
      runaway.style.zIndex = "25";
      runaway.style.width = "auto";
      runaway.style.maxWidth = "fit-content";
    } else {
      boundary = actions;
      boundary.style.position = "relative";
      boundary.style.minHeight = "96px";
      runaway.style.zIndex = "3";
      runaway.style.width = "";
      runaway.style.maxWidth = "";
    }
  }

  applyBoundary();

  function freezeRunaway() {
    isStopped = true;
    runaway.style.position = "static";
    runaway.style.left = "";
    runaway.style.top = "";
    runaway.style.zIndex = "";
    runaway.style.width = "";
    runaway.style.maxWidth = "";
  }

  const move = () => {
    if (isStopped) return;
    if (escapeCount >= maxEscapes) {
      freezeRunaway();
      return;
    }
    moveRunaway(runaway, boundary, yesButton);
    escapeCount += 1;
    if (escapeCount >= maxEscapes) {
      freezeRunaway();
    }
  };

  runaway.addEventListener("mouseenter", move);
  runaway.addEventListener("touchstart", move, { passive: true });
  window.addEventListener("resize", applyBoundary);
}

function spawnHearts() {
  const field = document.querySelector(".heart-field");
  if (!field) return;

  for (let i = 0; i < 24; i += 1) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.style.left = `${randomBetween(0, 100)}%`;
    heart.style.animationDelay = `${randomBetween(0, 8)}s`;
    heart.style.animationDuration = `${randomBetween(8, 14)}s`;
    field.appendChild(heart);
  }
}

function launchFlowers() {
  const field = document.querySelector(".rose-field");
  if (!field) return;
  field.innerHTML = "";

  for (let i = 0; i < 20; i += 1) {
    const flower = document.createElement("div");
    flower.className = "flower";
    flower.style.left = `${randomBetween(10, 90)}%`;
    flower.style.top = `${randomBetween(40, 80)}%`;
    flower.style.animationDelay = `${randomBetween(0, 0.6)}s`;
    field.appendChild(flower);
  }
}

function setupCaptureProtection() {
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  document.addEventListener("dragstart", (event) => event.preventDefault());
  document.addEventListener("selectstart", (event) => {
    const target = event.target;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
      return;
    }
    event.preventDefault();
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const meta = event.metaKey;
    const ctrl = event.ctrlKey;
    const shift = event.shiftKey;

    const macShot =
      meta && shift && (key === "3" || key === "4" || key === "5" || key === "s");
    const blocked =
      event.key === "PrintScreen" ||
      macShot ||
      ((meta || ctrl) && (key === "p" || key === "s" || key === "u")) ||
      key === "f12";

    if (blocked) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

window.addEventListener("hashchange", handleHash);

window.addEventListener("DOMContentLoaded", () => {
  setupCaptureProtection();
  spawnHearts();
  setupRunaway();
  handleHash();
});
