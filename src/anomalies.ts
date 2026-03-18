/**
 * 異変（アノマリー）の定義と適用
 *
 * 各異変は、ループ内のどのセクションにどのCSSクラスを付けるかで定義する。
 * sectionIndex は 0=nav, 1=hero, 2=about, 3=services, 4=stats, 5=team, 6=news, 7=cta, 8=footer
 */

interface AnomalyDefinition {
  name: string;
  /** ループコンテナ内の子要素インデックス */
  targetIndex: number;
  /** 付与するCSSクラス */
  className: string;
  /** 追加のDOM操作（クラスだけでは足りない場合） */
  mutate?: (loopEl: HTMLElement) => void;
}

const ANOMALY_DEFINITIONS: AnomalyDefinition[] = [
  {
    name: "glitch-hero",
    targetIndex: 1,
    className: "anomaly-glitch",
  },
  {
    name: "invert-about",
    targetIndex: 2,
    className: "anomaly-invert",
  },
  {
    name: "upsidedown-services",
    targetIndex: 3,
    className: "anomaly-upsidedown",
  },
  {
    name: "blink-stats",
    targetIndex: 4,
    className: "anomaly-blink",
  },
  {
    name: "zalgo-news",
    targetIndex: 6,
    className: "anomaly-zalgo",
  },
  {
    name: "tilt-about",
    targetIndex: 2,
    className: "anomaly-tilt",
  },
  {
    name: "creepy-bg-team",
    targetIndex: 5,
    className: "anomaly-creepy-bg",
  },
  {
    name: "shake-cta",
    targetIndex: 7,
    className: "anomaly-shake",
  },
  {
    name: "broken-nav",
    targetIndex: 0,
    className: "anomaly-broken-nav",
  },
  {
    name: "corrupt-stats",
    targetIndex: 4,
    className: "anomaly-corrupt-stats",
    mutate: (loopEl: HTMLElement) => {
      const statNumbers = loopEl.querySelectorAll(".stat-number");
      const corruptValues = ["E̵R̶R̸", "NaN", "-∞", "0x6"];
      statNumbers.forEach((el, i) => {
        el.textContent = corruptValues[i % corruptValues.length];
      });
    },
  },
  {
    name: "creepy-team",
    targetIndex: 5,
    className: "anomaly-creepy-team",
    mutate: (loopEl: HTMLElement) => {
      const avatars = loopEl.querySelectorAll(".team-avatar");
      avatars.forEach((el) => {
        el.textContent = "?";
      });
    },
  },
  {
    name: "wild-cta",
    targetIndex: 7,
    className: "anomaly-wild-cta",
  },
];

/** 使用済み異変インデックスを追跡 */
const usedAnomalyIndices: Set<number> = new Set();

/** ランダムに未使用の異変を1つ選ぶ。全て使用済みならリセットする */
export function pickRandomAnomaly(): AnomalyDefinition {
  if (usedAnomalyIndices.size >= ANOMALY_DEFINITIONS.length) {
    usedAnomalyIndices.clear();
  }

  const availableIndices = ANOMALY_DEFINITIONS
    .map((_, i) => i)
    .filter((i) => !usedAnomalyIndices.has(i));

  const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  usedAnomalyIndices.add(randomIndex);

  return ANOMALY_DEFINITIONS[randomIndex];
}

/** ループ要素に異変を適用する */
export function applyAnomaly(loopEl: HTMLElement, anomaly: AnomalyDefinition): void {
  const children = loopEl.children;
  if (anomaly.targetIndex < children.length) {
    children[anomaly.targetIndex].classList.add(anomaly.className);
  }
  if (anomaly.mutate) {
    anomaly.mutate(loopEl);
  }
}

export function resetUsedAnomalies(): void {
  usedAnomalyIndices.clear();
}
