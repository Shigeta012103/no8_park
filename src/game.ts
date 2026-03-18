import { renderLoop } from "./sections";
import {
  applyAnomaly,
  pickRandomAnomaly,
  resetUsedAnomalies,
  resetEncountered,
  getEncounteredAnomalies,
  getAllAnomalies,
  getActiveScrollTrigger,
  type AnomalyDefinition,
} from "./anomalies";

const CLEAR_COUNT = 8;
const ANOMALY_PROBABILITY = 0.5;
const MIN_SCROLL_BEFORE_RETURN = 100;
const MESSAGE_DISPLAY_MS = 1500;
const FLASH_DURATION_MS = 300;

interface GameState {
  correctCount: number;
  currentHasAnomaly: boolean;
  currentAnomaly: AnomalyDefinition | null;
  isTransitioning: boolean;
  lastScrollY: number;
  loopStartY: number;
  maxScrollY: number;
  messageTimer: ReturnType<typeof setTimeout> | null;
  anomalyCleanup: (() => void) | null;
}

function createInitialState(): GameState {
  return {
    correctCount: 0,
    currentHasAnomaly: false,
    currentAnomaly: null,
    isTransitioning: false,
    lastScrollY: 0,
    loopStartY: 0,
    maxScrollY: 0,
    messageTimer: null,
    anomalyCleanup: null,
  };
}

let state: GameState = createInitialState();
let corridorEl: HTMLElement;
let progressEl: HTMLElement;
let messageEl: HTMLElement;
let overlayEl: HTMLElement;
let overlayContentEl: HTMLElement;
let flashEl: HTMLElement;
let fixedLinkEl: HTMLAnchorElement;

export function initGame(): void {
  corridorEl = document.getElementById("corridor")!;
  progressEl = document.getElementById("progress")!;
  messageEl = document.getElementById("message")!;
  overlayEl = document.getElementById("overlay")!;
  overlayContentEl = document.getElementById("overlay-content")!;
  fixedLinkEl = document.getElementById("fixed-link") as HTMLAnchorElement;

  fixedLinkEl.addEventListener("click", (e) => e.preventDefault());

  flashEl = document.createElement("div");
  flashEl.className = "flash-overlay";
  document.body.appendChild(flashEl);

  showStartScreen();
}

function showStartScreen(): void {
  overlayContentEl.innerHTML = `
    <div class="start-screen">
      <h2>8番出口</h2>
      <p class="subtitle">コーポレートサイトからの脱出</p>
      <ul class="rules">
        <li>下にスクロールすると、コーポレートサイトが繰り返し表示されます</li>
        <li>UIに<strong>異変</strong>があれば → <strong>上にスクロール</strong>して引き返す</li>
        <li>異変がなければ → そのまま<strong>下にスクロール</strong>して進む</li>
        <li><strong>8回</strong>正解すれば出口に到着！</li>
      </ul>
      <button type="button" id="start-button">ゲームスタート</button>
    </div>
  `;
  overlayEl.classList.remove("hidden");
  document.getElementById("start-button")!.addEventListener("click", startGame);
}

function startGame(): void {
  state = createInitialState();
  resetUsedAnomalies();
  resetEncountered();
  updateHud();
  overlayEl.classList.add("hidden");
  setupLoop();
  window.addEventListener("scroll", handleScroll, { passive: true });
}

function cleanupCurrentAnomaly(): void {
  if (state.anomalyCleanup) {
    state.anomalyCleanup();
    state.anomalyCleanup = null;
  }
  resetFixedLink();
  document.body.classList.remove("anomaly-static");
}

function resetFixedLink(): void {
  fixedLinkEl.textContent = "お問い合わせ →";
}

function setupLoop(): void {
  cleanupCurrentAnomaly();
  corridorEl.innerHTML = "";

  const loopWrapper = document.createElement("div");
  loopWrapper.className = "loop-wrapper";
  loopWrapper.innerHTML = renderLoop();
  corridorEl.appendChild(loopWrapper);

  state.currentHasAnomaly = Math.random() < ANOMALY_PROBABILITY;
  state.currentAnomaly = null;

  if (state.currentHasAnomaly) {
    const anomaly = pickRandomAnomaly();
    state.currentAnomaly = anomaly;
    state.anomalyCleanup = applyAnomaly(loopWrapper, anomaly);

  }

  updateHud();
  window.scrollTo(0, 0);
  state.lastScrollY = 0;
  state.loopStartY = 0;
  state.maxScrollY = 0;
}

function handleScroll(): void {
  if (state.isTransitioning) return;

  const currentY = window.scrollY;
  const loopWrapper = corridorEl.querySelector(".loop-wrapper") as HTMLElement | null;
  if (!loopWrapper) return;

  if (currentY > state.maxScrollY) {
    state.maxScrollY = currentY;
  }

  const loopHeight = loopWrapper.offsetHeight;
  const scrolledInLoop = currentY - state.loopStartY;
  const scrollRatio = scrolledInLoop / loopHeight;
  const hasSeenEnough = state.maxScrollY >= MIN_SCROLL_BEFORE_RETURN;

  if (state.currentAnomaly) {
    const trigger = getActiveScrollTrigger(state.currentAnomaly);
    if (trigger) {
      if (scrollRatio >= trigger.ratio) {
        trigger.activate();
      } else {
        trigger.deactivate();
      }
    }
  }

  if (scrolledInLoop >= loopHeight - window.innerHeight - 1) {
    handleJudgment("down");
    return;
  }

  if (hasSeenEnough && currentY <= state.loopStartY) {
    handleJudgment("up");
    return;
  }

  state.lastScrollY = currentY;
}

function handleJudgment(direction: "up" | "down"): void {
  if (state.isTransitioning) return;
  state.isTransitioning = true;

  const scrolledUp = direction === "up";
  const isCorrect = state.currentHasAnomaly ? scrolledUp : !scrolledUp;

  if (isCorrect) {
    state.correctCount++;
    updateHud();

    if (state.correctCount >= CLEAR_COUNT) {
      showClearScreen();
      return;
    }
    showMessage("正解！ 先に進めます...");
  } else {
    state.correctCount = 0;
    updateHud();
    showMessage("不正解... 最初からやり直し");
  }

  flashTransition(() => {
    setupLoop();
    state.isTransitioning = false;
  });
}

function flashTransition(callback: () => void): void {
  flashEl.classList.add("active");
  setTimeout(() => {
    callback();
    setTimeout(() => {
      flashEl.classList.remove("active");
    }, 50);
  }, FLASH_DURATION_MS);
}

function showMessage(text: string): void {
  messageEl.textContent = text;
  messageEl.classList.add("show");
  if (state.messageTimer) clearTimeout(state.messageTimer);
  state.messageTimer = setTimeout(() => {
    messageEl.classList.remove("show");
  }, MESSAGE_DISPLAY_MS);
}

function updateHud(): void {
  progressEl.textContent = `${state.correctCount} / ${CLEAR_COUNT}`;
}

function showClearScreen(): void {
  window.removeEventListener("scroll", handleScroll);
  cleanupCurrentAnomaly();

  const encountered = getEncounteredAnomalies();
  const all = getAllAnomalies();

  overlayContentEl.innerHTML = `
    <div class="clear-screen">
      <h2>おめでとうございます！</h2>
      <p>8番出口に到達しました。<br>あなたは異変を見抜く達人です。</p>
      <p class="encounter-stat">遭遇した異変: ${encountered.size} / ${all.length}（未遭遇: ${all.length - encountered.size}）</p>
      <div class="clear-buttons">
        <button type="button" id="show-list-button">異変一覧を見る</button>
        <button type="button" id="restart-button">もう一度遊ぶ</button>
      </div>
    </div>
  `;
  overlayEl.classList.remove("hidden");

  document.getElementById("show-list-button")!.addEventListener("click", () => {
    showAnomalyList(encountered, all);
  });
  document.getElementById("restart-button")!.addEventListener("click", () => {
    overlayEl.classList.add("hidden");
    startGame();
  });
}

function showAnomalyList(
  encountered: Map<string, string>,
  all: Array<{ name: string; displayName: string; difficulty: string }>,
): void {
  const easyList = all.filter((a) => a.difficulty === "easy");
  const hardList = all.filter((a) => a.difficulty === "hard");

  const renderList = (items: typeof all): string =>
    items
      .map((a) => {
        const found = encountered.has(a.name);
        const icon = found ? "&#10003;" : "???";
        const label = found ? a.displayName : "？？？";
        const cls = found ? "found" : "not-found";
        return `<li class="${cls}"><span class="check">${icon}</span> ${label}</li>`;
      })
      .join("");

  overlayContentEl.innerHTML = `
    <div class="anomaly-list-screen">
      <h2>異変一覧</h2>
      <h3>分かりやすい異変 (${easyList.filter((a) => encountered.has(a.name)).length}/${easyList.length})</h3>
      <ul class="anomaly-list">${renderList(easyList)}</ul>
      <h3>分かりづらい異変 (${hardList.filter((a) => encountered.has(a.name)).length}/${hardList.length})</h3>
      <ul class="anomaly-list">${renderList(hardList)}</ul>
      <button type="button" id="back-to-clear">戻る</button>
    </div>
  `;

  document.getElementById("back-to-clear")!.addEventListener("click", () => {
    showClearScreen();
  });
}
