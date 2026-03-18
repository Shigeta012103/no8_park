/**
 * 異変（アノマリー）の定義と適用
 * sectionIndex: 0=spacer, 1=nav, 2=hero, 3=about, 4=services, 5=stats, 6=team, 7=news, 8=cta, 9=footer, 10=spacer
 */

export interface AnomalyDefinition {
  name: string;
  displayName: string;
  difficulty: "easy" | "hard";
  targetIndex?: number;
  className?: string;
  mutate?: (loopEl: HTMLElement) => void;
  /** body に付与するクラス（オーバーレイ系） */
  bodyClass?: string;
  /** DOM要素を生成して返す。game側でクリーンアップする */
  createOverlay?: () => HTMLElement;
  /** スクロール位置に応じた発火(0〜1)。trueを返したらアクティベート */
  scrollTrigger?: { ratio: number; activate: () => void; deactivate: () => void };
}

const TOTAL_ANOMALIES = 30;

function createBloodOverlay(): HTMLElement {
  const container = document.createElement("div");
  container.className = "blood-overlay";
  const splats = [
    { top: "8%", left: "15%", size: 60, rot: 20 },
    { top: "25%", right: "10%", size: 80, rot: -35 },
    { top: "45%", left: "5%", size: 50, rot: 45 },
    { top: "60%", right: "20%", size: 70, rot: -15 },
    { top: "15%", left: "60%", size: 40, rot: 60 },
    { top: "75%", left: "30%", size: 55, rot: -40 },
    { top: "35%", right: "5%", size: 45, rot: 10 },
  ];
  for (const s of splats) {
    const dot = document.createElement("div");
    dot.className = "blood-splat";
    dot.style.top = s.top;
    if (s.left) dot.style.left = s.left;
    if (s.right) dot.style.right = s.right;
    dot.style.width = `${s.size}px`;
    dot.style.height = `${s.size}px`;
    dot.style.transform = `rotate(${s.rot}deg)`;
    container.appendChild(dot);
  }
  return container;
}

function createFakeDialog(): HTMLElement {
  const el = document.createElement("div");
  el.className = "fake-clear-overlay";
  el.innerHTML = `
    <div class="fake-clear-dialog">
      <h2>おめでとうございます！</h2>
      <p>訳あって8番出口に到達しました！<br>一番下までスクロールしてゲームを終了してください！</p>
      <button type="button">ゲームを終了する</button>
    </div>
  `;
  el.querySelector("button")!.addEventListener("click", (e) => e.preventDefault());
  return el;
}

function createPowerOutageOverlay(): HTMLElement {
  const el = document.createElement("div");
  el.className = "power-outage-overlay";
  return el;
}

const ANOMALY_DEFINITIONS: AnomalyDefinition[] = [
  // ===== 分かりやすい異変 (20) =====
  { name: "glitch-hero", displayName: "ヒーローの微振動", difficulty: "easy", targetIndex: 2, className: "anomaly-glitch" },
  { name: "invert-about", displayName: "会社概要の色反転", difficulty: "easy", targetIndex: 3, className: "anomaly-invert" },
  { name: "upsidedown-services", displayName: "事業内容タイトルの1文字反転", difficulty: "easy", targetIndex: 4,
    mutate: (el: HTMLElement) => {
      const title = el.querySelectorAll(".section-title")[2];
      if (!title || !title.textContent) return;
      const text = title.textContent;
      title.innerHTML = text[0] + `<span style="display:inline-block;transform:rotate(180deg)">${text[1]}</span>` + text.slice(2);
    },
  },
  { name: "blink-stats", displayName: "実績セクションの赤い点滅", difficulty: "easy", targetIndex: 5, className: "anomaly-blink" },
  { name: "zalgo-news", displayName: "お知らせがComic Sans", difficulty: "easy", targetIndex: 7, className: "anomaly-zalgo" },
  { name: "tilt-section", displayName: "セクションの傾き", difficulty: "easy", targetIndex: 3, className: "anomaly-tilt" },
  { name: "creepy-bg-team", displayName: "チームセクションがフェードアウト", difficulty: "easy", targetIndex: 6, className: "anomaly-fadeout" },
  { name: "shake-cta", displayName: "CTAセクションの振動", difficulty: "easy", targetIndex: 8, className: "anomaly-shake" },
  { name: "broken-nav", displayName: "ナビゲーション崩壊", difficulty: "easy", targetIndex: 1, className: "anomaly-broken-nav" },
  { name: "corrupt-stats", displayName: "数値のバグ", difficulty: "easy", targetIndex: 5, className: "anomaly-corrupt-stats",
    mutate: (el: HTMLElement) => {
      const nums = el.querySelectorAll(".stat-number");
      ["E̵R̶R̸", "NaN", "-∞", "0x6"].forEach((v, i) => { if (nums[i]) nums[i].textContent = v; });
    },
  },
  { name: "creepy-team", displayName: "チームメンバーが「?」", difficulty: "easy", targetIndex: 6,
    mutate: (el: HTMLElement) => { el.querySelectorAll(".team-avatar").forEach((a) => { a.textContent = "?"; }); },
  },
  { name: "wild-cta", displayName: "CTAボタンが膨張", difficulty: "easy", targetIndex: 8, className: "anomaly-wild-cta" },
  { name: "mirror-hero", displayName: "ヒーローの左右反転", difficulty: "easy", targetIndex: 2, className: "anomaly-mirror" },
  { name: "giant-title", displayName: "巨大タイトル", difficulty: "easy", targetIndex: 4, className: "anomaly-giant" },
  { name: "blood-splatter", displayName: "画面の血飛沫", difficulty: "easy", createOverlay: createBloodOverlay },
  { name: "power-outage", displayName: "停電", difficulty: "easy",
    createOverlay: createPowerOutageOverlay,
    scrollTrigger: {
      ratio: 0.4,
      activate: () => { document.querySelector(".power-outage-overlay")?.classList.add("active"); },
      deactivate: () => { document.querySelector(".power-outage-overlay")?.classList.remove("active"); },
    },
  },
  { name: "all-turnback", displayName: "全テキスト「引き返せ」", difficulty: "easy",
    mutate: (el: HTMLElement) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node: Text | null;
      while ((node = walker.nextNode() as Text | null)) {
        const trimmed = node.textContent?.trim();
        if (trimmed && trimmed.length > 1) {
          node.textContent = "引き返せ";
        }
      }
    },
  },
  { name: "fake-clear", displayName: "偽クリアダイアログ", difficulty: "easy",
    createOverlay: createFakeDialog,
    scrollTrigger: {
      ratio: 0.35,
      activate: () => { document.querySelector(".fake-clear-overlay")?.classList.add("active"); },
      deactivate: () => { document.querySelector(".fake-clear-overlay")?.classList.remove("active"); },
    },
  },
  { name: "fixed-link-red", displayName: "固定ボタンの文言変化", difficulty: "easy",
    mutate: () => {
      const btn = document.getElementById("fixed-link");
      if (btn) {
        btn.textContent = "助けて";
      }
    },
  },
  { name: "static-noise", displayName: "画面ノイズ", difficulty: "easy", bodyClass: "anomaly-static" },

  // ===== 分かりづらい異変 (10) =====
  { name: "nav-typo", displayName: "ナビのタイポ「地下労働」", difficulty: "hard", targetIndex: 1,
    mutate: (el: HTMLElement) => {
      const items = el.querySelectorAll(".nav-links li");
      items.forEach((li) => { if (li.textContent === "事業内容") li.textContent = "地下労働"; });
    },
  },
  { name: "stat-off", displayName: "数値が微妙に違う", difficulty: "hard", targetIndex: 5,
    mutate: (el: HTMLElement) => {
      const nums = el.querySelectorAll(".stat-number");
      if (nums[0]) nums[0].textContent = "150000+";
    },
  },
  { name: "team-role-swap", displayName: "メンバーの役職が異世界", difficulty: "hard", targetIndex: 6,
    mutate: (el: HTMLElement) => {
      const roles = el.querySelectorAll(".team-member p");
      const fantasyRoles = ["勇者", "魔法使い", "騎士"];
      roles.forEach((p, i) => { if (fantasyRoles[i]) p.textContent = fantasyRoles[i]; });
    },
  },
  { name: "extra-news", displayName: "ニュースが大量に増えている", difficulty: "hard", targetIndex: 7,
    mutate: (el: HTMLElement) => {
      const inner = el.querySelectorAll(".section-inner")[4];
      if (!inner) return;
      const extras = [
        "2024.12.20 — 社内ハッカソンを開催しました。",
        "2024.11.05 — 第3回AIカンファレンスに登壇しました。",
        "2024.10.18 — 新卒採用を開始しました。",
        "2024.09.01 — セキュリティ認証ISO27001を取得しました。",
        "2024.08.15 — 夏季休暇のお知らせ。",
        "2024.07.22 — パートナー企業と業務提携を締結しました。",
        "2024.06.10 — 社内勉強会レポートを公開しました。",
        "2024.05.01 — GW休業のお知らせ。",
        "2024.04.15 — オフィス増床のお知らせ。",
        "2024.03.20 — 年度末決算報告を公開しました。",
      ];
      for (const text of extras) {
        const p = document.createElement("p");
        p.className = "section-text";
        p.textContent = text;
        inner.appendChild(p);
      }
    },
  },
  { name: "wrong-year", displayName: "フッターの年号が違う", difficulty: "hard", targetIndex: 9,
    mutate: (el: HTMLElement) => {
      const footer = el.querySelector(".corp-footer");
      if (footer) footer.innerHTML = "&copy; 44444444 株式会社ノーマル All Rights Reserved.";
    },
  },
  { name: "missing-service", displayName: "サービスカードが1枚少ない", difficulty: "hard", targetIndex: 4,
    mutate: (el: HTMLElement) => {
      const cards = el.querySelectorAll(".service-card");
      if (cards[2]) cards[2].remove();
    },
  },
  { name: "logo-typo", displayName: "ロゴのタイポ「ノーマレーシア」", difficulty: "hard", targetIndex: 1,
    mutate: (el: HTMLElement) => {
      const logo = el.querySelector(".logo-text");
      if (logo) logo.textContent = "株式会社ノーマレーシア";
    },
  },
  { name: "extra-nav", displayName: "ナビ項目が3つ多い", difficulty: "hard", targetIndex: 1,
    mutate: (el: HTMLElement) => {
      const navLinks = el.querySelector(".nav-links");
      if (!navLinks) return;
      for (const label of ["採用情報", "IR情報", "プライバシー"]) {
        const li = document.createElement("li");
        li.textContent = label;
        navLinks.appendChild(li);
      }
    },
  },
  { name: "cta-typo", displayName: "CTAテキストが豹変", difficulty: "hard", targetIndex: 8,
    mutate: (el: HTMLElement) => {
      const h3 = el.querySelector(".cta-box h3");
      if (h3) h3.textContent = "もう二度と相談してくるな。ぶち殺すぞ。";
    },
  },
  { name: "news-future-date", displayName: "ニュースの日付が未来", difficulty: "hard", targetIndex: 7,
    mutate: (el: HTMLElement) => {
      const texts = el.querySelectorAll(".corp-section:nth-child(8) .section-text");
      if (texts[0]) texts[0].textContent = "37564.03.01 — 新オフィスを東京・渋谷に移転しました。";
    },
  },
];

/** 使用済みインデックス追跡 */
const usedAnomalyIndices: Set<number> = new Set();

/** 遭遇済み異変追跡 */
const encounteredAnomalies: Map<string, string> = new Map();

export function pickRandomAnomaly(): AnomalyDefinition {
  if (usedAnomalyIndices.size >= ANOMALY_DEFINITIONS.length) {
    usedAnomalyIndices.clear();
  }
  const available = ANOMALY_DEFINITIONS.map((_, i) => i).filter((i) => !usedAnomalyIndices.has(i));
  const idx = available[Math.floor(Math.random() * available.length)];
  usedAnomalyIndices.add(idx);
  return ANOMALY_DEFINITIONS[idx];
}

export function applyAnomaly(loopEl: HTMLElement, anomaly: AnomalyDefinition): (() => void) {
  const cleanups: (() => void)[] = [];

  if (anomaly.targetIndex !== undefined && anomaly.className) {
    const child = loopEl.children[anomaly.targetIndex];
    if (child) child.classList.add(anomaly.className);
  }
  if (anomaly.mutate) {
    anomaly.mutate(loopEl);
  }
  if (anomaly.bodyClass) {
    document.body.classList.add(anomaly.bodyClass);
    cleanups.push(() => document.body.classList.remove(anomaly.bodyClass!));
  }
  if (anomaly.createOverlay) {
    const overlay = anomaly.createOverlay();
    document.body.appendChild(overlay);
    cleanups.push(() => overlay.remove());
  }

  encounteredAnomalies.set(anomaly.name, anomaly.displayName);

  return () => { cleanups.forEach((fn) => fn()); };
}

export function getEncounteredAnomalies(): Map<string, string> {
  return encounteredAnomalies;
}

export function getUnseenCount(): number {
  return TOTAL_ANOMALIES - encounteredAnomalies.size;
}

export function getAllAnomalies(): Array<{ name: string; displayName: string; difficulty: string }> {
  return ANOMALY_DEFINITIONS.map((a) => ({
    name: a.name,
    displayName: a.displayName,
    difficulty: a.difficulty,
  }));
}

export function getActiveScrollTrigger(anomaly: AnomalyDefinition): AnomalyDefinition["scrollTrigger"] {
  return anomaly.scrollTrigger;
}

export function resetUsedAnomalies(): void {
  usedAnomalyIndices.clear();
}

export function resetEncountered(): void {
  encounteredAnomalies.clear();
}
