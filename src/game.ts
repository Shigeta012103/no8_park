import { renderLoop } from "./sections";
import { applyAnomaly, pickRandomAnomaly, resetUsedAnomalies } from "./anomalies";

const CLEAR_COUNT = 8;
const ANOMALY_PROBABILITY = 0.5;
/** 「引き返す」判定に必要な最低スクロール量(px) */
const MIN_SCROLL_BEFORE_RETURN = 100;
const MESSAGE_DISPLAY_MS = 1500;
const FLASH_DURATION_MS = 300;

interface GameState {
  correctCount: number;
  currentHasAnomaly: boolean;
  isTransitioning: boolean;
  lastScrollY: number;
  loopStartY: number;
  maxScrollY: number;
  messageTimer: ReturnType<typeof setTimeout> | null;
}

let state: GameState = {
  correctCount: 0,
  currentHasAnomaly: false,
  isTransitioning: false,
  lastScrollY: 0,
  loopStartY: 0,
  maxScrollY: 0,
  messageTimer: null,
};

let corridorEl: HTMLElement;
let progressEl: HTMLElement;
let messageEl: HTMLElement;
let overlayEl: HTMLElement;
let overlayContentEl: HTMLElement;
let flashEl: HTMLElement;

export function initGame(): void {
  corridorEl = document.getElementById("corridor")!;
  progressEl = document.getElementById("progress")!;
  messageEl = document.getElementById("message")!;
  overlayEl = document.getElementById("overlay")!;
  overlayContentEl = document.getElementById("overlay-content")!;

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
  state = {
    correctCount: 0,
    currentHasAnomaly: false,
    isTransitioning: false,
    lastScrollY: 0,
    loopStartY: 0,
    maxScrollY: 0,
    messageTimer: null,
  };
  resetUsedAnomalies();
  updateProgress();
  overlayEl.classList.add("hidden");

  setupLoop();
  window.addEventListener("scroll", handleScroll, { passive: true });
}

function setupLoop(): void {
  corridorEl.innerHTML = "";

  const loopWrapper = document.createElement("div");
  loopWrapper.className = "loop-wrapper";
  loopWrapper.innerHTML = renderLoop();
  corridorEl.appendChild(loopWrapper);

  state.currentHasAnomaly = Math.random() < ANOMALY_PROBABILITY;

  if (state.currentHasAnomaly) {
    const anomaly = pickRandomAnomaly();
    applyAnomaly(loopWrapper, anomaly);
  }

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
  const hasSeenEnough = state.maxScrollY >= MIN_SCROLL_BEFORE_RETURN;

  // 下にスクロールしてループの終端に到達 → 「進む」判定
  if (scrolledInLoop >= loopHeight - window.innerHeight - 1) {
    handleJudgment("down");
    return;
  }

  // 十分下まで見てからトップ付近まで戻った → 「引き返す」判定
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
    updateProgress();

    if (state.correctCount >= CLEAR_COUNT) {
      showClearScreen();
      return;
    }

    showMessage("正解！ 先に進めます...");
  } else {
    state.correctCount = 0;
    updateProgress();
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

  if (state.messageTimer) {
    clearTimeout(state.messageTimer);
  }

  state.messageTimer = setTimeout(() => {
    messageEl.classList.remove("show");
  }, MESSAGE_DISPLAY_MS);
}

function updateProgress(): void {
  progressEl.textContent = `${state.correctCount} / ${CLEAR_COUNT}`;
}

function showClearScreen(): void {
  window.removeEventListener("scroll", handleScroll);

  overlayContentEl.innerHTML = `
    <div class="clear-screen">
      <h2>おめでとうございます！</h2>
      <p>8番出口に到達しました。<br>あなたは異変を見抜く達人です。</p>
      <button type="button" id="restart-button">もう一度遊ぶ</button>
    </div>
  `;
  overlayEl.classList.remove("hidden");

  document.getElementById("restart-button")!.addEventListener("click", () => {
    overlayEl.classList.add("hidden");
    startGame();
  });
}
