const applyDamage = (target, amount) => {
  const mitigated = Math.max(0, amount - target.guard);
  if (target.guard > 0) {
    target.guard = Math.max(0, target.guard - 1);
  }
  target.hp -= mitigated;
  // ダメージで0以下になった場合も即勝敗判定できるようにする
  // （効果ダメージ等で checkWinner 呼び忘れがあってもゲームが止まらないように）
  checkWinner();
  return mitigated;
};

const lemonImageUrl =
  "./レモンちゃんデッキ/春のれもんちゃん.jpg";

// デフォルトのプレマシート（ユーザーが未設定のときだけ使われる）
// GitHub Pages 上ではファイル名の Unicode 正規化（例: プレマ / プレマ）や AVIF の配信都合で
// 読み込めないケースがあるため、複数候補＋フォールバックを用意する。
// まずは Pages で確実に表示できる PNG を優先する。
const defaultPlaymatUrls = ["./assets/playmat.png", "./プレマ.avif", "./プレマ.avif"];
const defaultPlaymatFallbackUrl = "./レモンちゃんデッキ/れもんちゃんbackground.jpeg";

const seasons = ["春", "夏", "秋", "冬", "無"];

const exileFromSoul = (fighter, count, predicate = () => true) => {
  const picked = [];
  for (let i = fighter.soul.length - 1; i >= 0 && picked.length < count; i -= 1) {
    if (!predicate(fighter.soul[i])) continue;
    picked.push(fighter.soul.splice(i, 1)[0]);
  }
  picked.forEach((c) => fighter.banished.push(c));
  return picked.length;
};

const exileTopDeck = (fighter) => {
  const top = fighter.deck.shift();
  if (!top) return false;
  fighter.banished.push(top);
  return true;
};

const drawN = (fighter, whoLabel, n) => {
  let ok = 0;
  for (let i = 0; i < n; i += 1) {
    if (drawCard(fighter, whoLabel)) ok += 1;
  }
  return ok;
};

const imageCardCatalog = [
  {
    id: "c8",
    name: "春のれもんちゃん",
    attribute: "場所札",
    trait: "猫",
    season: "春",
    cost: 0,
    power: 1,
    imageUrl: lemonImageUrl,
    summonEffect: () => "（効果なし）",
  },
  {
    id: "LT-02",
    name: "夏のれもんちゃん",
    attribute: "場所札",
    trait: "猫",
    season: "夏",
    cost: 0,
    power: 1,
    imageUrl:
      "./レモンちゃんデッキ/夏のれもんちゃん.jpg",
    summonEffect: () => "（効果なし）",
  },
  {
    id: "LT-03",
    name: "秋のれもんちゃん",
    attribute: "場所札",
    trait: "猫",
    season: "秋",
    cost: 0,
    power: 1,
    imageUrl:
      "./レモンちゃんデッキ/秋のれもんちゃん.jpg",
    summonEffect: () => "（効果なし）",
  },
  {
    id: "LT-04",
    name: "冬のれもんちゃん",
    attribute: "場所札",
    trait: "猫",
    season: "冬",
    cost: 0,
    power: 1,
    imageUrl:
      "./レモンちゃんデッキ/冬のれもんちゃん.jpg",
    summonEffect: () => "（効果なし）",
  },
  {
    id: "LT-05",
    name: "いちごちゃん",
    attribute: "怪異札",
    trait: "いちご",
    season: "春",
    cost: 0,
    imageUrl:
      "./レモンちゃんデッキ/いちごちゃん.jpg",
    summonEffect: (self, foe) => {
      self.hp += 2;
      foe.hp += 2;
      return "自分と相手は2点のライフを得る";
    },
  },
  {
    id: "LT-06",
    name: "すいかちゃん",
    attribute: "怪異札",
    trait: "すいか",
    season: "夏",
    cost: 0,
    imageUrl:
      "./レモンちゃんデッキ/すいかちゃん.jpg",
    summonEffect: (self, foe) => {
      const a = applyDamage(self, 2);
      const b = applyDamage(foe, 2);
      return `自分と相手に2点ダメージ（自分${a}/相手${b}）`;
    },
  },
  {
    id: "LT-07",
    name: "かきちゃん",
    attribute: "怪異札",
    trait: "かき",
    season: "秋",
    cost: 0,
    imageUrl:
      "./レモンちゃんデッキ/かきちゃん.jpg",
    summonEffect: (self, foe) => {
      const a = drawN(self, "自分", 1);
      const b = drawN(foe, "相手", 1);
      return `自分と相手は山札から1枚札を引く（自分${a}枚/相手${b}枚）`;
    },
  },
  {
    id: "LT-08",
    name: "みかんさん",
    attribute: "怪異札",
    trait: "みかん",
    season: "冬",
    cost: 0,
    imageUrl:
      "./レモンちゃんデッキ/みかんさん.jpg",
    summonEffect: (self, foe) => {
      const a = exileTopDeck(self);
      const b = exileTopDeck(foe);
      return `自分と相手は山札の1番上の札を1枚除外する（自分${a ? 1 : 0}枚/相手${b ? 1 : 0}枚）`;
    },
  },
  {
    id: "LT-09",
    name: "お花畑のれもんちゃん",
    attribute: "場所札",
    trait: "猫/園",
    season: "春",
    cost: 4,
    power: 4,
    imageUrl:
      "./レモンちゃんデッキ/お花畑のれもんちゃん.jpg",
    attackEffect: (self) => {
      self.hp += 1;
      return "自分は1点のライフを得る";
    },
  },
  {
    id: "LT-10",
    name: "磯のれもんちゃん",
    attribute: "場所札",
    trait: "猫/海",
    season: "夏",
    cost: 4,
    power: 3,
    imageUrl:
      "./レモンちゃんデッキ/磯のれもんちゃん.jpg",
    summonEffect: (self, foe) => {
      const dealt = applyDamage(foe, 2);
      return `相手に2点ダメージ（実ダメ${dealt}）`;
    },
  },
  {
    id: "LT-11",
    name: "よく食べるれもんちゃん",
    attribute: "場所札",
    trait: "猫/糧",
    season: "秋",
    cost: 4,
    power: 3,
    imageUrl:
      "./レモンちゃんデッキ/よく食べるれもんちゃん.jpg",
    attackEffect: (self) => {
      const d = drawN(self, "自分", 1);
      return `自分は山札から1枚札を引く（${d}枚）`;
    },
  },
  {
    id: "LT-12",
    name: "お化けはっけん",
    attribute: "場所札",
    trait: "猫/幽霊",
    season: "冬",
    cost: 4,
    power: 3,
    imageUrl:
      "./レモンちゃんデッキ/おばけはっけん.jpg",
    attackEffect: (self, foe) => {
      const removed = exileFromSoul(foe, 1, (c) => c.attribute === "場所札");
      return `相手の魂の【場所札】を${removed}枚除外`;
    },
  },
  {
    id: "LT-13",
    name: "場所のれもんちゃん",
    attribute: "場所札",
    trait: "猫/災害",
    season: "春",
    cost: 6,
    power: 3,
    imageUrl:
      "./レモンちゃんデッキ/場所のれもんちゃん.jpg",
    summonEffect: (self) => {
      self.hp += 3;
      return "自分は3点のライフを得る";
    },
  },
  {
    id: "LT-14",
    name: "怪異のれもんちゃん",
    attribute: "怪異札",
    trait: "猫/怨霊",
    season: "夏",
    cost: 6,
    imageUrl:
      "./レモンちゃんデッキ/怪異のれもんちゃん.jpg",
    summonEffect: (self, foe) => {
      const dealt = applyDamage(foe, 5);
      return `相手に5点ダメージ（実ダメ${dealt}）`;
    },
  },
  {
    id: "LT-15",
    name: "季節のれもんちゃん",
    attribute: "季節札",
    trait: "猫/花",
    season: "秋",
    cost: 6,
    imageUrl:
      "./レモンちゃんデッキ/季節のれもんちゃん.jpg",
    // 簡易実装: 場にこのカードがある状態で「秋」の場所札を出すと2ドロー
    passive: { kind: "onSummonLocation", season: "秋", draw: 2 },
    summonEffect: () => "（継続効果）",
  },
  {
    id: "LT-16",
    name: "道具のれもんちゃん",
    attribute: "道具札",
    trait: "猫/鏡",
    season: "冬",
    cost: 6,
    imageUrl:
      "./レモンちゃんデッキ/道具のれもんちゃん.jpg",
    summonEffect: (self, foe) => {
      const removed = exileFromSoul(foe, 1);
      return `相手の魂を${removed}枚除外`;
    },
  },
  {
    id: "LT-17",
    name: "わんちゃんかわいい",
    attribute: "場所札",
    trait: "猫/犬族",
    season: "春",
    cost: 8,
    power: 8,
    imageUrl:
      "./レモンちゃんデッキ/わんちゃんかわいい.jpg",
    attackEffect: (self) => {
      self.hp += 2;
      return "自分は2点のライフを得る";
    },
  },
  {
    id: "LT-18",
    name: "エビ来た！",
    attribute: "場所札",
    trait: "猫/蟲",
    season: "夏",
    cost: 8,
    power: 8,
    imageUrl:
      "./レモンちゃんデッキ/エビ来た!.jpg",
    attackEffect: (self, foe) => {
      const dealt = applyDamage(foe, 2);
      return `相手に2点ダメージ（実ダメ${dealt}）`;
    },
  },
  {
    id: "LT-19",
    name: "とけいこわい",
    attribute: "場所札",
    trait: "猫/からくり",
    season: "秋",
    cost: 8,
    power: 7,
    imageUrl:
      "./レモンちゃんデッキ/とけいこわい.jpg",
    attackEffect: (self) => {
      const d = drawN(self, "自分", 2);
      return `自分は山札から2枚札を引く（${d}枚）`;
    },
  },
  {
    id: "LT-20",
    name: "あたたかいだす。",
    attribute: "場所札",
    trait: "猫/妖怪",
    season: "冬",
    cost: 8,
    power: 7,
    imageUrl:
      "./レモンちゃんデッキ/あたたかいだす.jpg",
    attackEffect: (self, foe) => {
      const removed = exileFromSoul(foe, 2);
      return `相手の魂を${removed}枚除外`;
    },
  },
];

const cardCatalog = [
  ...imageCardCatalog,
].sort((a, b) => {
  const costA = Number(a?.cost ?? 0) || 0;
  const costB = Number(b?.cost ?? 0) || 0;
  if (costA !== costB) return costA - costB;

  // 種類の優先順：場所札→怪異札→季節札→道具札
  const attributeRank = (attribute) => {
    switch (attribute) {
      case "場所札":
        return 0;
      case "怪異札":
        return 1;
      case "季節札":
        return 2;
      case "道具札":
        return 3;
      default:
        return 999;
    }
  };
  const attributeA = attributeRank(a?.attribute);
  const attributeB = attributeRank(b?.attribute);
  if (attributeA !== attributeB) return attributeA - attributeB;

  const seasonRank = (season) => {
    const idx = seasons.indexOf(season);
    return idx === -1 ? 999 : idx; // 春→夏→秋→冬→無 の順
  };
  const seasonA = seasonRank(a?.season);
  const seasonB = seasonRank(b?.season);
  if (seasonA !== seasonB) return seasonA - seasonB;

  // 同値の並びを安定させるためのタイブレーク（見た目の揺れ防止）
  const trait = String(a?.trait ?? "").localeCompare(String(b?.trait ?? ""), "ja");
  if (trait !== 0) return trait;
  const name = String(a?.name ?? "").localeCompare(String(b?.name ?? ""), "ja");
  if (name !== 0) return name;
  return String(a?.id ?? "").localeCompare(String(b?.id ?? ""), "ja");
});

const state = {
  player: null,
  enemy: null,
  turn: "player",
  logs: [],
  gameOver: false,
  deckChoice: {
    active: false,
    picked: "", // "springSummer" | "autumnWinter" | ""
  },
  result: {
    kind: "", // "player" | "enemy" | "draw" | ""
    title: "",
    subtitle: "",
  },
  phase: "-",
  ui: {
    selectedFieldCardId: "", // 場（場所札）から攻撃対象を選ぶ
    selectedHandCardId: "", // 手札から「出す札」を選択
    selectedHandFrom: "", // "hand" | "openHand"
    possessTargetId: "", // 怪異札の憑依先（明示選択）
    possessSelecting: false, // 憑依先選択モード
    attackSelecting: false, // 攻撃先選択モード
  },
  handLimit: {
    active: false,
    needed: 0,
    selection: new Set(), // `${from}:${cardId}`
  },
  bgm: {
    url: "./BGM/Asian Ambient Phonk.mp3",
    volume: 0.15,
    playing: false,
    objectUrl: "",
  },
  mulligan: {
    active: false,
    used: false,
    selection: new Set(),
  },
  turnNumber: 1,
  startingPlayer: "player",
  hasDrawn: false,
  playmat: {
    url: defaultPlaymatUrls[0],
    opacity: 1,
    fit: "contain",
    _resolveKey: "",
    _resolvedUrl: "",
  },
};

const elements = {
  playerHp: document.getElementById("player-hp"),
  enemyHp: document.getElementById("enemy-hp"),
  handArea: document.getElementById("hand-area"),
  deckArea: document.getElementById("deck-area"),
  banishArea: document.getElementById("banish-area"),
  deckCount: document.getElementById("deck-count"),
  enemyDeckArea: document.getElementById("enemy-deck-area"),
  enemyBanishArea: document.getElementById("enemy-banish-area"),
  enemyDeckCount: document.getElementById("enemy-deck-count"),
  playerField: document.getElementById("player-field"),
  enemyField: document.getElementById("enemy-field"),
  playerSeasonArea: document.getElementById("player-season-area"),
  enemySeasonArea: document.getElementById("enemy-season-area"),
  logArea: document.getElementById("log-area"),
  resetBtn: document.getElementById("reset-btn"),
  mulliganBtn: document.getElementById("mulligan-btn"),
  mulliganConfirmBtn: document.getElementById("mulligan-confirm-btn"),
  attackBtn: document.getElementById("attack-btn"),
  endBtn: document.getElementById("end-btn"),
  playerSoulArea: document.getElementById("player-soul-area"),
  enemySoulArea: document.getElementById("enemy-soul-area"),
  phaseLabel: document.getElementById("phase-label"),
  enemyHandArea: document.getElementById("enemy-hand-area"),
  openHandArea: document.getElementById("open-hand-area"),
  playerPlaymatLayer: document.getElementById("player-playmat-layer"),
  enemyPlaymatLayer: document.getElementById("enemy-playmat-layer"),
  bgmToggle: document.getElementById("bgm-toggle"),
  bgmVolume: document.getElementById("bgm-volume"),
  bgmFile: document.getElementById("bgm-file"),
  bgmUrl: document.getElementById("bgm-url"),
  bgmLoad: document.getElementById("bgm-load"),
  declareLocationSummon: document.getElementById("declare-location-summon"),
  declareLocationAttack: document.getElementById("declare-location-attack"),
  declareAnomalyPossess: document.getElementById("declare-anomaly-possess"),
  declareSeasonDeploy: document.getElementById("declare-season-deploy"),
  declareToolUse: document.getElementById("declare-tool-use"),
  logSection: document.getElementById("log-section"),
  logToggle: document.getElementById("log-toggle"),
  bgmSection: document.getElementById("bgm-section"),
  bgmCollapse: document.getElementById("bgm-collapse"),
  resultOverlay: document.getElementById("result-overlay"),
  resultTitle: document.getElementById("result-title"),
  resultSubtitle: document.getElementById("result-subtitle"),
  resultReset: document.getElementById("result-reset"),
  deckOverlay: document.getElementById("deck-overlay"),
  deckPickSpringSummer: document.getElementById("deck-pick-spring-summer"),
  deckPickAutumnWinter: document.getElementById("deck-pick-autumn-winter"),
  quickAttackBtn: document.getElementById("quick-attack-btn"),
  quickEndBtn: document.getElementById("quick-end-btn"),
};

const setDeckOverlayVisible = (visible) => {
  const show = Boolean(visible);
  state.deckChoice.active = show;
  if (elements.deckOverlay) {
    elements.deckOverlay.classList.toggle("deck-overlay--show", show);
    elements.deckOverlay.setAttribute("aria-hidden", show ? "false" : "true");
  }
};

const getDeckPrototypes = (key) => {
  const k = key || "";
  const ok =
    k === "springSummer"
      ? (season) => season === "春" || season === "夏"
      : k === "autumnWinter"
        ? (season) => season === "秋" || season === "冬"
        : () => true;
  return cardCatalog.filter((c) => ok(c?.season));
};

const getOppositeDeckKey = (key) => (key === "springSummer" ? "autumnWinter" : "springSummer");

const startGameWithDeckChoice = (playerKey) => {
  const picked = playerKey === "autumnWinter" ? "autumnWinter" : "springSummer";
  state.deckChoice.picked = picked;
  setDeckOverlayVisible(false);

  const enemyKey = getOppositeDeckKey(picked);
  state.player = createFighter(getDeckPrototypes(picked));
  state.enemy = createFighter(getDeckPrototypes(enemyKey));
  state.turn = "player";
  state.logs = [];
  state.gameOver = false;
  state.result.kind = "";
  state.result.title = "";
  state.result.subtitle = "";
  state.phase = "-";
  state.ui.selectedFieldCardId = "";
  clearHandSelection();
  clearAttackSelection();
  state.mulligan.active = false;
  state.mulligan.used = false;
  state.mulligan.selection = new Set();
  state.turnNumber = 1;
  state.startingPlayer = "player";
  state.hasDrawn = false;

  for (let i = 0; i < 8; i += 1) {
    drawCard(state.player, "自分");
    drawCard(state.enemy, "相手");
  }
  log(`デッキ選択: 自分=${picked === "springSummer" ? "春夏" : "秋冬"} / 相手=${enemyKey === "springSummer" ? "春夏" : "秋冬"}`);
  log("ゲーム開始（初期手札8枚）");
  startTurn("player");
  render();
};

const initDeckChoiceUi = () => {
  elements.deckPickSpringSummer?.addEventListener("click", () => startGameWithDeckChoice("springSummer"));
  elements.deckPickAutumnWinter?.addEventListener("click", () => startGameWithDeckChoice("autumnWinter"));
};

const clearHandSelection = () => {
  state.ui.selectedHandCardId = "";
  state.ui.selectedHandFrom = "";
  // 怪異札選択が絡んでいたら解除
  state.ui.possessSelecting = false;
  state.ui.possessTargetId = "";
};

const clearAttackSelection = () => {
  state.ui.attackSelecting = false;
  state.ui.selectedFieldCardId = "";
};

const getSelectedHandCard = () => {
  const id = state.ui?.selectedHandCardId || "";
  const from = state.ui?.selectedHandFrom || "";
  if (!id || !from) return null;
  const origin = from === "openHand" ? state.player.openHand : state.player.hand;
  const card = origin.find((c) => c.id === id) || null;
  if (!card) return null;
  return { card, origin, from };
};

const cloneCard = (card) => ({ ...card });

const bgmAudio = new Audio();
bgmAudio.loop = true;
bgmAudio.preload = "auto";

const resolveFirstLoadableImageUrl = (urls, done) => {
  const list = (Array.isArray(urls) ? urls : []).filter((u) => typeof u === "string" && u.trim() !== "");
  if (list.length === 0) {
    done("");
    return;
  }
  const tryAt = (idx) => {
    const u = list[idx];
    const img = new Image();
    img.onload = () => done(u);
    img.onerror = () => {
      if (idx + 1 < list.length) tryAt(idx + 1);
      else done("");
    };
    img.src = encodeURI(u);
  };
  tryAt(0);
};

const applyPlaymatSettings = () => {
  const layers = [elements.playerPlaymatLayer, elements.enemyPlaymatLayer].filter(Boolean);
  if (layers.length === 0) return;
  const raw = state.playmat.url?.trim?.() ?? "";
  const key = raw || "__default__";
  const opacity = String(state.playmat.opacity ?? 1);
  const size = state.playmat.fit ?? "contain";

  // 透過・サイズは即反映
  for (const layer of layers) {
    layer.style.opacity = opacity;
    layer.style.backgroundSize = size;
  }

  const apply = (u) => {
    const finalUrl = (u ?? "").trim();
    for (const layer of layers) {
      layer.style.backgroundImage = finalUrl ? `url("${encodeURI(finalUrl)}")` : "none";
    }
  };

  // 既に解決済みなら即適用
  if (state.playmat._resolveKey === key && state.playmat._resolvedUrl) {
    apply(state.playmat._resolvedUrl);
    return;
  }

  state.playmat._resolveKey = key;
  state.playmat._resolvedUrl = "";

  const candidates = raw ? [raw] : defaultPlaymatUrls;
  resolveFirstLoadableImageUrl(candidates, (ok) => {
    // 解決中に別URLに変わっていたら破棄
    if (state.playmat._resolveKey !== key) return;
    const resolved = ok || defaultPlaymatFallbackUrl || "";
    state.playmat._resolvedUrl = resolved;
    apply(resolved);
  });
};

const updateBgmUi = () => {
  if (elements.bgmVolume) {
    elements.bgmVolume.value = String(state.bgm.volume ?? 0.4);
  }
  if (elements.bgmUrl && elements.bgmUrl.value.trim() === "") {
    elements.bgmUrl.value = state.bgm.url ?? "./bgm.mp3";
  }
  if (elements.bgmToggle) {
    elements.bgmToggle.textContent = state.bgm.playing ? "停止" : "再生";
  }
};

const setBgmSource = (url) => {
  const trimmed = (url ?? "").trim();
  if (!trimmed) return;
  state.bgm.url = trimmed;
  // スペース等を含むパスでも読めるようにする（blob/data はそのまま）
  bgmAudio.src =
    trimmed.startsWith("blob:") || trimmed.startsWith("data:")
      ? trimmed
      : encodeURI(trimmed);
  bgmAudio.load();
};

const stopBgm = () => {
  state.bgm.playing = false;
  state.bgm.autoStart = false;
  try {
    bgmAudio.pause();
  } catch {
    // ignore
  }
  updateBgmUi();
};

const playBgm = async () => {
  state.bgm.autoStart = true;
  bgmAudio.volume = Math.min(1, Math.max(0, Number(state.bgm.volume ?? 0.4)));
  if (!bgmAudio.src) {
    setBgmSource(state.bgm.url || "./bgm.mp3");
  }
  try {
    await bgmAudio.play();
    state.bgm.playing = true;
    updateBgmUi();
  } catch {
    state.bgm.playing = false;
    updateBgmUi();
    log("BGMは最初に操作（クリック）してから再生できます / ファイルが見つからない可能性があります");
    render();
  }
};

// モバイルUI（盤面切替 / 右パネルドロワー）
const initMobileUi = () => {
  const btnPlayer = document.getElementById("mobile-view-player");
  const btnEnemy = document.getElementById("mobile-view-enemy");
  const btnPanel = document.getElementById("mobile-toggle-panel");
  const backdrop = document.getElementById("mobile-backdrop");
  if (!btnPlayer || !btnEnemy || !btnPanel) return;

  const setView = (view) => {
    document.body.classList.toggle("mobile-view-player", view === "player");
    document.body.classList.toggle("mobile-view-enemy", view === "enemy");
  };
  const setPanelOpen = (open) => {
    document.body.classList.toggle("mobile-panel-open", Boolean(open));
    if (backdrop) backdrop.setAttribute("aria-hidden", open ? "false" : "true");
  };

  // 初期は自分盤面
  if (!document.body.classList.contains("mobile-view-player") && !document.body.classList.contains("mobile-view-enemy")) {
    setView("player");
  }

  btnPlayer.addEventListener("click", () => {
    setPanelOpen(false);
    setView("player");
  });
  btnEnemy.addEventListener("click", () => {
    setPanelOpen(false);
    setView("enemy");
  });
  btnPanel.addEventListener("click", () => {
    const open = document.body.classList.contains("mobile-panel-open");
    setPanelOpen(!open);
  });
  backdrop?.addEventListener("click", () => setPanelOpen(false));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setPanelOpen(false);
  });
};

const initBgmAutostart = () => {
  // デフォルトは「再生したい」状態（停止ボタンで止める運用）
  state.bgm.autoStart = state.bgm.autoStart ?? true;
  if (!state.bgm.autoStart) return;

  // まずは即時に再生を試みる（許可されている環境ではこれで鳴る）
  playBgm();

  // 自動再生がブロックされる環境向け：最初のユーザー操作で1回だけ再生を試す
  const tryStartOnce = () => {
    if (!state.bgm.autoStart || state.bgm.playing) return;
    playBgm();
  };
  const opts = { once: true, capture: true };
  window.addEventListener("pointerdown", tryStartOnce, opts);
  window.addEventListener("keydown", tryStartOnce, opts);
};

const initBgmUi = () => {
  updateBgmUi();

  elements.bgmVolume?.addEventListener("input", () => {
    state.bgm.volume = Number(elements.bgmVolume.value);
    bgmAudio.volume = Math.min(1, Math.max(0, state.bgm.volume));
  });

  elements.bgmToggle?.addEventListener("click", () => {
    if (state.bgm.playing) {
      stopBgm();
      return;
    }
    playBgm();
  });

  elements.bgmLoad?.addEventListener("click", () => {
    const url = elements.bgmUrl?.value ?? "";
    setBgmSource(url);
    log("BGMを読み込みました（再生ボタンで開始）");
    render();
    updateBgmUi();
  });

  elements.bgmFile?.addEventListener("change", () => {
    const file = elements.bgmFile.files?.[0];
    if (!file) return;
    if (state.bgm.objectUrl) {
      try {
        URL.revokeObjectURL(state.bgm.objectUrl);
      } catch {
        // ignore
      }
      state.bgm.objectUrl = "";
    }
    const objUrl = URL.createObjectURL(file);
    state.bgm.objectUrl = objUrl;
    setBgmSource(objUrl);
    log("BGMファイルを読み込みました（再生ボタンで開始）");
    render();
    updateBgmUi();
  });
};

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// デッキは「山札＋初期手札」合計40枚になるように作る
// ※card.id は D&D で一意に必要なので、複製時にインスタンスIDへ置き換える
const buildDeck = (prototypes, deckSize = 40, maxCopiesPerCard = 4) => {
  const src = Array.isArray(prototypes) ? prototypes.filter(Boolean) : [];
  if (src.length === 0) return [];
  const pool = [];
  for (const proto of src) {
    const copies = Math.max(1, Math.min(maxCopiesPerCard, Number(maxCopiesPerCard) || 4));
    for (let i = 1; i <= copies; i += 1) {
      const card = cloneCard(proto);
      card.id = `${proto.id}#${String(i).padStart(2, "0")}`;
      pool.push(card);
    }
  }
  shuffle(pool);
  // ルール上、種類が少ないと40枚作れない（max 4枚制限）ので、その場合は作れるだけにする
  return pool.slice(0, Math.min(deckSize, pool.length));
};

const createFighter = (deckPrototypes = cardCatalog) => ({
  hp: 30,
  soul: [],
  guard: 0,
  deck: buildDeck(deckPrototypes, 40, 4),
  hand: [],
  openHand: [],
  banished: [],
  field: [], // 場（場所札）：複数枚残留する
  seasonField: null, // 季節札（場とは別枠で保持）
  seasonTop: null, // 季節札の上の【場所札】（1枚）
  possessions: {}, // { [locationId: string]: 怪異札[] }（古い順で解決）
  tool: {
    usedInWindow: false, // 自分のターン開始→次の自分のターン開始までに1回
    lockedUntilLocationSouls: false, // 攻撃宣言時に未使用なら、場所札が魂になるまでロック
  },
  mainUsed: {
    locationSummon: false,
    locationAttack: false,
    anomalyPossess: false,
    seasonDeploy: false,
  },
});

const log = (text) => {
  state.logs.unshift(text);
  state.logs = state.logs.slice(0, 40);
};

const getSoulCount = (fighter) => fighter.soul.length;

const getTotalHandCount = (fighter) => fighter.hand.length + fighter.openHand.length;

const hasSeasonInSoul = (fighter, season) =>
  fighter.soul.some((card) => card.season === season);

// 「季節札」が場にある場合も、その季節の条件を満たしている扱いにする
// （季節札は効果使用後も魂に行かず場に残るため、魂条件だけだと進行が滞りやすい）
const hasSeasonAvailable = (fighter, season) => {
  if (!fighter || !season) return false;
  if (hasSeasonInSoul(fighter, season)) return true;
  const fieldSeason = fighter?.seasonField?.season ?? "";
  return fieldSeason === season;
};

const getCannotPlayReason = (fighter, card) => {
  const cost = Number(card?.cost ?? 0) || 0;
  const soul = getSoulCount(fighter);
  const season = String(card?.season ?? "");
  if (cost <= 0) return "";
  if (season === "無") {
    return soul < cost ? `魂が足りない（必要${cost}/現在${soul}）` : "";
  }
  const fieldSeason = fighter?.seasonField?.season ?? "";
  const hasSoulSeason = hasSeasonInSoul(fighter, season);
  if (soul < cost) return `魂が足りない（必要${cost}/現在${soul}）`;
  if (!hasSoulSeason && fieldSeason !== season) {
    return `季節条件を満たしていない（必要:${season} / 魂:${hasSoulSeason ? "あり" : "なし"} / 場の季節:${fieldSeason || "なし"}）`;
  }
  return "";
};

const canPlayCard = (fighter, card) => {
  if (!card) return false;
  const cost = Number(card.cost ?? 0) || 0;
  if (cost === 0) return true;
  // 公式ルール: 「無」の季節は、どの季節の魂でも使える
  if (card.season === "無") return cost <= getSoulCount(fighter);
  if (!hasSeasonAvailable(fighter, card.season)) return false;
  return cost <= getSoulCount(fighter);
};

const canPlaceInSoul = (card) => card.attribute === "道具札";

const isSeasonCard = (card) => card && card.attribute === "季節札";

const drawCard = (fighter, who) => {
  if (fighter.deck.length === 0) {
    log(`${who}の山札が空です`);
    return false;
  }
  if (getTotalHandCount(fighter) >= 12) {
    log(`${who}の手札が満杯です`);
    return false;
  }
  const card = fighter.deck.shift();
  fighter.hand.push(card);
  log(`${who}がドロー`);
  return true;
};

const trimHandToEightAtEnd = (fighter, whoLabel) => {
  while (getTotalHandCount(fighter) > 8) {
    const card = fighter.hand.pop() ?? fighter.openHand.pop();
    if (!card) break;
    placeInSoul(fighter, card, whoLabel);
  }
};

const getMainSubphaseLabel = (key) => {
  switch (key) {
    case "locationSummon":
      return "【場所札】召喚";
    case "locationAttack":
      return "【場所札】攻撃";
    case "anomalyPossess":
      return "【怪異札】憑依";
    case "seasonDeploy":
      return "【季節札】展開";
    default:
      return "-";
  }
};

const resetMainSubphases = (fighter) => {
  if (!fighter?.mainUsed) return;
  fighter.mainUsed.locationSummon = false;
  fighter.mainUsed.locationAttack = false;
  fighter.mainUsed.anomalyPossess = false;
  fighter.mainUsed.seasonDeploy = false;
};

const consumeMainSubphase = (fighter, key) => {
  if (!fighter?.mainUsed) return;
  fighter.mainUsed[key] = true;
};

const isHandLimitLocked = () => state.handLimit.active;

const canUseToolNow = (fighter) => {
  // 手札調整中はどちらも道具札使用不可
  if (state.phase === "エンドフェイズ" && state.handLimit.active) return false;
  if (!fighter?.tool) return true;
  if (fighter.tool.usedInWindow) return false;
  if (fighter.tool.lockedUntilLocationSouls) return false;
  return true;
};

const meetsDeclarationForCard = (fighter, card) => {
  if (!card) return false;
  if (state.phase !== "メインフェイズ") return { ok: false, reason: "メインフェイズでのみ行動できます" };
  if (state.turn !== "player") return { ok: false, reason: "自分のターンではありません" };
  if (state.handLimit.active) return { ok: false, reason: "手札調整中です" };

  if (card.attribute === "道具札") {
    if (!canUseToolNow(fighter)) return { ok: false, reason: "この間、道具札は使用できません" };
    return { ok: true };
  }

  const needKey =
    card.attribute === "場所札"
      ? "locationSummon"
      : card.attribute === "怪異札"
        ? "anomalyPossess"
        : card.attribute === "季節札"
          ? "seasonDeploy"
          : null;

  if (!needKey) return { ok: true };
  if (fighter?.mainUsed?.[needKey])
    return { ok: false, reason: `${getMainSubphaseLabel(needKey)}はこのターンすでに使用しています` };
  return { ok: true, needKey };
};

const playCard = (self, foe, card, who) => {
  // 継続効果（簡易）：季節札の上に場所札が召喚された時など
  // 互換：過去の状態で季節札が self.field に乗っていても動くように拾う
  const legacySeason =
    self.field && !Array.isArray(self.field) && isSeasonCard(self.field)
      ? self.field
      : null;
  const passiveSource = self.seasonField ?? legacySeason;
  if (
    passiveSource?.passive?.kind === "onSummonLocation" &&
    card.attribute === "場所札" &&
    card.season === passiveSource.passive.season
  ) {
    const d = drawN(self, who, Number(passiveSource.passive.draw) || 0);
    log(`${who}の継続効果: ${passiveSource.name} → ${d}枚ドロー`);
  }

  // 重要：場（場所札）は上書きしない。魂に行くのは「攻撃した時」か「効果で移動した時」だけ。

  // 道具札：使用後に魂へ
  if (card.attribute === "道具札") {
    if (self?.tool) self.tool.usedInWindow = true;
    const detail = (card.summonEffect ?? card.effect)?.(self, foe);
    log(`${who}が${card.name}を使用: ${detail || "（効果なし）"}`);
    placeInSoul(self, card, who);
    return;
  }

  // 季節札：場とは別枠に保持（場のカードを消さない）
  if (card.attribute === "季節札") {
    if (self.seasonField) {
      // 季節札が場を離れた場合、季節札の上の札はすべて魂
      if (self.seasonTop) {
        moveLocationAndPossessionsToSoul(self, self.seasonTop, who);
        self.seasonTop = null;
      }
      placeInSoul(self, self.seasonField, who);
    }
    self.seasonField = card;
    const detail = (card.summonEffect ?? card.effect)?.(self, foe);
    log(`${who}が${card.name}を展開: ${detail || "（効果なし）"}`);
    return;
  }

  // 怪異札：単体では使用不可（場所札に裏向きで憑依して使う）
  if (card.attribute === "怪異札") {
    log("怪異札は【場所札】に裏向きで憑依して使います");
    // 呼び出し側で手札へ戻す想定（ここでは捨てない）
    return;
  }

  // 場所札：場に出して残留（攻撃で魂へ移動）
  if (card.attribute === "場所札") {
    // 手札から場に出したときは「表表示のまま、伏せ（攻撃不可）」にする
    card.facedown = false;
    card.set = true;
    card.sleeping = false;
    if (!Array.isArray(self.field)) self.field = [];
    self.field.push(card);

    const detail = (card.summonEffect ?? card.effect)?.(self, foe);
    log(`${who}が${card.name}を召喚: ${detail || "（効果なし）"}`);
    return;
  }

  // その他：とりあえず除外
  const detail = (card.summonEffect ?? card.effect)?.(self, foe);
  log(`${who}が${card.name}を使用: ${detail || "（効果なし）"}`);
  self.banished.push(card);
};

const attackWithField = (attacker, defender, who, cardId) => {
  const locations = getAllLocationCards(attacker);
  if (locations.length === 0) {
    log("場にカードがありません");
    return false;
  }

  const getLocationPower = (c) => {
    // 公式ルール: 場所札の左下の「力」ぶん、相手のライフにダメージ
    // costとは別物。カードデータに power を入れてそれを参照する。
    const raw = c?.power ?? c?.force ?? c?.strength ?? c?.atk ?? c?.attack ?? 0;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  };

  const isAttackableLocation = (c) =>
    c &&
    c.attribute === "場所札" &&
    !c.facedown &&
    !(c.set || c.sleeping);

  const pickAuto = () => {
    // 右（末尾）側優先で、攻撃可能な場所札を探す
    for (let i = locations.length - 1; i >= 0; i -= 1) {
      if (isAttackableLocation(locations[i].card)) return i;
    }
    return -1;
  };
  const pickById = (id) => locations.findIndex((x) => x.card?.id === id);

  const pickIndex = cardId ? pickById(cardId) : pickAuto();
  if (pickIndex === -1) {
    log(cardId ? "その場札は攻撃できません" : "攻撃できる場札がありません");
    return false;
  }

  const { card, zone, index } = locations[pickIndex];
  if (!isAttackableLocation(card)) {
    log("伏せのカードは攻撃できません");
    return false;
  }

  log(`${who}が場のカードで攻撃`);

  // ①怪異札（憑依）があれば古い順で先に解決（コスト未達なら不発）
  const anomalies = getPossessionList(attacker, card.id);
  anomalies.forEach((a) => {
    if (!a) return;
    a.facedown = false;
    if (!canPlayCard(attacker, a)) {
      log(`${who}の憑依（${a.name}）はコスト条件未達で不発`);
      return;
    }
    const d = (a.summonEffect ?? a.effect)?.(attacker, defender);
    log(`${who}の憑依（${a.name}）: ${d || "（効果なし）"}`);
  });

  // ②場所札の攻撃時効果
  const attackDetail = card.attackEffect?.(attacker, defender);
  if (attackDetail) {
    log(`${who}の攻撃効果: ${attackDetail}`);
  }

  // ③基本ダメージ：力ぶん相手ライフを減らす
  const power = getLocationPower(card);
  if (power > 0) {
    const dealt = applyDamage(defender, power);
    log(`${who}の基本ダメージ: 力${power} → 実ダメ${dealt}`);
  } else {
    log(`${who}の基本ダメージ: 力0（ダメージなし）`);
  }

  // ④攻撃後：場所札と憑依していた怪異札は同時に魂
  if (zone === "field") {
    attacker.field.splice(index, 1);
  } else if (zone === "seasonTop") {
    attacker.seasonTop = null;
  }
  moveLocationAndPossessionsToSoul(attacker, card, who);

  // 選択中のカードが消えたら選択解除
  if (who === "自分" && state.ui?.selectedFieldCardId === card.id) {
    state.ui.selectedFieldCardId = "";
  }
  return true;
};

const placeInSoul = (fighter, card, who) => {
  fighter.soul.push(card);
  log(`${who}が${card.name}を魂に置いた`);
};

const ensurePossessions = (fighter) => {
  if (!fighter.possessions) fighter.possessions = {};
  return fighter.possessions;
};

const getPossessionList = (fighter, locationId) => {
  const p = ensurePossessions(fighter);
  if (!p[locationId]) p[locationId] = [];
  return p[locationId];
};

const attachPossession = (fighter, locationId, anomalyCard) => {
  if (!anomalyCard?.id || !locationId) return false;
  anomalyCard.facedown = true;
  const list = getPossessionList(fighter, locationId);
  list.push(anomalyCard);
  return true;
};

const movePossessionsToSoul = (fighter, locationId, whoLabel) => {
  const list = getPossessionList(fighter, locationId);
  if (list.length === 0) return 0;
  const moving = list.splice(0, list.length);
  moving.forEach((c) => placeInSoul(fighter, c, whoLabel));
  return moving.length;
};

const moveLocationAndPossessionsToSoul = (fighter, locationCard, whoLabel) => {
  if (!locationCard?.id) return;
  const moved = movePossessionsToSoul(fighter, locationCard.id, whoLabel);
  placeInSoul(fighter, locationCard, whoLabel);
  if (moved > 0) log(`${whoLabel}の怪異札${moved}枚も同時に魂へ`);
  // 道具札ロック解除条件：場所札が魂になったタイミング
  if (fighter?.tool?.lockedUntilLocationSouls) fighter.tool.lockedUntilLocationSouls = false;
};

const getAllLocationCards = (fighter) => {
  const list = [];
  const field = Array.isArray(fighter.field) ? fighter.field : fighter.field ? [fighter.field] : [];
  field.forEach((card, index) => list.push({ card, zone: "field", index }));
  if (fighter.seasonTop) list.push({ card: fighter.seasonTop, zone: "seasonTop", index: 0 });
  return list.filter((x) => x.card);
};

const isAttackableLocationCard = (card) =>
  card &&
  card.attribute === "場所札" &&
  !card.facedown &&
  !(card.set || card.sleeping);

const checkWinner = () => {
  if (state.gameOver) return true;
  if (state.player.hp <= 0 && state.enemy.hp <= 0) {
    state.gameOver = true;
    state.result.kind = "draw";
    state.result.title = "引き分け";
    state.result.subtitle = "開始 / リセットで再戦";
    log("引き分け");
    return true;
  }
  if (state.player.hp <= 0) {
    state.gameOver = true;
    state.result.kind = "enemy";
    state.result.title = "相手の勝利";
    state.result.subtitle = "開始 / リセットで再戦";
    log("相手の勝利");
    return true;
  }
  if (state.enemy.hp <= 0) {
    state.gameOver = true;
    state.result.kind = "player";
    state.result.title = "自分の勝利";
    state.result.subtitle = "開始 / リセットで再戦";
    log("自分の勝利");
    return true;
  }
  return false;
};

const startTurn = (who) => {
  state.phase = "ターン開始フェイズ";
  state.hasDrawn = false;
  state.handLimit.active = false;
  state.handLimit.needed = 0;
  state.handLimit.selection.clear();
  log(`${who === "player" ? "自分" : "相手"}のターン開始を宣言`);

  state.phase = "回復フェイズ";
  const fighter = who === "player" ? state.player : state.enemy;
  resetMainSubphases(fighter);
  if (fighter?.tool) {
    // 1回/自ターン区間（ロックは解除しない）
    fighter.tool.usedInWindow = false;
  }
  const fieldCards = Array.isArray(fighter.field)
    ? fighter.field
    : fighter.field
      ? [fighter.field]
      : [];
  let woke = 0;
  fieldCards.forEach((c) => {
    if (!c) return;
    if (c.set || c.sleeping) {
      c.set = false;
      c.sleeping = false;
      woke += 1;
    }
  });
  if (fighter.seasonTop && (fighter.seasonTop.set || fighter.seasonTop.sleeping)) {
    fighter.seasonTop.set = false;
    fighter.seasonTop.sleeping = false;
    woke += 1;
  }
  if (woke > 0) {
    log(`${who === "player" ? "自分" : "相手"}の場のカードが起きた（${woke}枚）`);
  }
  if (who === "player") {
    log("自分のターン開始（回復フェイズ）");
    if (canDrawThisTurn("player")) {
      state.phase = "ドローフェイズ";
      drawCard(state.player, "自分");
      state.hasDrawn = true;
    }
    state.phase = "メインフェイズ";
  } else {
    log("相手のターン開始（回復フェイズ）");
  }
};

const canDrawThisTurn = (who) => {
  if (state.hasDrawn) return false;
  if (who === state.startingPlayer && state.turnNumber === 1) return false;
  return true;
};

const enemyTurn = () => {
  if (state.gameOver) return;
  state.turn = "enemy";
  startTurn("enemy");
  if (canDrawThisTurn("enemy")) {
    state.phase = "ドローフェイズ";
    drawCard(state.enemy, "相手");
    state.hasDrawn = true;
  }
  state.phase = "メインフェイズ";

  // 相手も各フェーズ権を各1回（できる範囲で）
  const enemy = state.enemy;
  const canUseMainRightFor = (card) => {
    if (!card) return false;
    if (card.attribute === "道具札") return canUseToolNow(enemy);
    if (card.attribute === "場所札") return !enemy.mainUsed.locationSummon;
    if (card.attribute === "怪異札") return !enemy.mainUsed.anomalyPossess;
    if (card.attribute === "季節札") return !enemy.mainUsed.seasonDeploy;
    return true;
  };

  // まず攻撃できるなら攻撃（場所札攻撃権）
  if (!enemy.mainUsed.locationAttack) {
    if (attackWithField(enemy, state.player, "相手")) {
      consumeMainSubphase(enemy, "locationAttack");
      // ライフが0になった瞬間に勝利表示（以降の行動を止める）
      if (checkWinner()) {
        render();
        return;
      }
    }
  }

  const playable = enemy.hand.filter((card) => {
    if (!card) return false;
    if (card.attribute === "怪異札") return false; // TODO: 相手の憑依AIは別途実装
    if (!canPlayCard(enemy, card)) return false;
    return canUseMainRightFor(card);
  });
  if (playable.length > 0) {
    const card = playable[Math.floor(Math.random() * playable.length)];
    enemy.hand = enemy.hand.filter((c) => c !== card);
    playCard(enemy, state.player, card, "相手");
    if (card.attribute === "場所札") consumeMainSubphase(enemy, "locationSummon");
    if (card.attribute === "怪異札") consumeMainSubphase(enemy, "anomalyPossess");
    if (card.attribute === "季節札") consumeMainSubphase(enemy, "seasonDeploy");
  } else {
    const soulable = enemy.hand.filter((c) => {
      if (!c) return false;
      if (!canPlaceInSoul(c)) return false;
      if (!canPlayCard(enemy, c)) return false;
      // 道具札はターン内の使用制限を守る
      if (c.attribute === "道具札") return canUseToolNow(enemy);
      return true;
    });
    if (soulable.length > 0) {
      const card = soulable[Math.floor(Math.random() * soulable.length)];
      enemy.hand = enemy.hand.filter((c) => c !== card);
      playCard(enemy, state.player, card, "相手");
    } else {
      log("相手は何もできない");
    }
  }
  checkWinner();
  state.phase = "エンドフェイズ";
  trimHandToEightAtEnd(state.enemy, "相手");
  state.turn = "player";
  state.turnNumber += 1;
  startTurn("player");
  render();
};

const resetGame = () => {
  // まずデッキを選んでから初期手札を配る
  state.player = createFighter([]);
  state.enemy = createFighter([]);
  state.turn = "player";
  state.logs = [];
  state.gameOver = false;
  state.result.kind = "";
  state.result.title = "";
  state.result.subtitle = "";
  state.phase = "-";
  state.ui.selectedFieldCardId = "";
  clearHandSelection();
  clearAttackSelection();
  state.mulligan.active = false;
  state.mulligan.used = false;
  state.mulligan.selection = new Set();
  state.turnNumber = 1;
  state.startingPlayer = "player";
  state.hasDrawn = false;
  render();
  setDeckOverlayVisible(true);
};

const renderSoulArea = (fighter, element) => {
  if (!element) return;
  element.innerHTML = "";
  const all = fighter.soul ?? [];
  const overflowCount = Math.max(0, all.length - 5);
  const visible = overflowCount > 0 ? all.slice(all.length - 5) : all;
  const overflow = overflowCount > 0 ? all.slice(0, all.length - 5) : [];

  // 直近5枚は通常表示
  visible.forEach((card) => {
    const soulCard = document.createElement("div");
    soulCard.className = "soul-preview-card";
    const image = card.imageUrl
      ? `<img class="card-image" src="${card.imageUrl}" alt="${card.name}" />`
      : "";
    soulCard.innerHTML = `${image}`;
    element.appendChild(soulCard);
  });

  if (overflowCount > 0) {
    const stack = document.createElement("div");
    stack.className = "soul-stack";
    stack.tabIndex = 0;
    stack.setAttribute("aria-label", `魂まとめ（+${overflowCount}枚）`);

    const preview = document.createElement("div");
    preview.className = "soul-stack-preview";
    const previewCards = overflow.slice(Math.max(0, overflow.length - 5));
    previewCards.forEach((card, i) => {
      const p = document.createElement("div");
      p.className = "soul-stack-card";
      p.style.setProperty("--stack-i", String(i));
      const img = card.imageUrl
        ? `<img class="card-image" src="${card.imageUrl}" alt="${card.name}" />`
        : "";
      p.innerHTML = img;
      preview.appendChild(p);
    });

    const badge = document.createElement("div");
    badge.className = "soul-stack-badge";
    badge.textContent = `+${overflowCount}`;

    const popup = document.createElement("div");
    popup.className = "soul-stack-popup";
    const popupGrid = document.createElement("div");
    popupGrid.className = "soul-stack-popup-grid";
    overflow.forEach((card) => {
      const item = document.createElement("div");
      item.className = "soul-preview-card soul-preview-card--tiny";
      const img = card.imageUrl
        ? `<img class="card-image" src="${card.imageUrl}" alt="${card.name}" />`
        : "";
      item.innerHTML = img;
      popupGrid.appendChild(item);
    });
    popup.appendChild(popupGrid);

    stack.appendChild(preview);
    stack.appendChild(badge);
    stack.appendChild(popup);
    element.appendChild(stack);
  }
};

const renderBanishArea = (fighter, element) => {
  if (!element) return;
  element.innerHTML = "";
  const all = Array.isArray(fighter?.banished) ? fighter.banished : [];
  if (all.length === 0) return;

  // 最新（直近で除外された）カードを表向きで常時表示
  const top = all[all.length - 1] || null;
  const prev = all.slice(0, Math.max(0, all.length - 1)).slice().reverse(); // 新しい順

  const topEl = document.createElement("div");
  topEl.className = "banish-top";
  const image = top?.imageUrl
    ? `<img class="card-image" src="${top.imageUrl}" alt="${top.name}" />`
    : "";
  topEl.innerHTML = image;
  element.appendChild(topEl);

  // 過去の除外札はホバーで一覧表示（直近以外）
  if (prev.length > 0) {
    const badge = document.createElement("div");
    badge.className = "banish-prev-badge";
    badge.textContent = `+${prev.length}`;
    element.appendChild(badge);

    const popup = document.createElement("div");
    popup.className = "banish-prev-popup";
    const grid = document.createElement("div");
    grid.className = "banish-prev-popup-grid";
    prev.forEach((card) => {
      const item = document.createElement("div");
      item.className = "banish-prev-card";
      const img = card?.imageUrl
        ? `<img class="card-image" src="${card.imageUrl}" alt="${card.name}" />`
        : "";
      item.innerHTML = img;
      grid.appendChild(item);
    });
    popup.appendChild(grid);
    element.appendChild(popup);
  }
};

const layoutHandFan = (container, options) => {
  if (!container) return;
  const cards = Array.from(container.children).filter(
    (el) => el.classList.contains("card") || el.classList.contains("card-back"),
  );
  const n = cards.length;
  if (n === 0) return;

  const maxAngle = options?.maxAngle ?? 20;
  const spreadX = options?.spreadX ?? 56;
  const liftY = options?.liftY ?? 22;
  const direction = options?.direction ?? "down"; // "down" | "up"
  const angleSign = options?.angleSign ?? 1; // 1 or -1（相手は上下反転なので-1）

  const mid = (n - 1) / 2;
  for (let i = 0; i < n; i += 1) {
    const t = n === 1 ? 0 : (i - mid) / mid; // -1..1
    const angle = t * maxAngle * angleSign;
    const x = t * spreadX * Math.min(1, (n - 1) / 6);
    const yCurve = (1 - Math.abs(t)) * liftY; // center up
    const y = direction === "down" ? -yCurve : yCurve;
    const el = cards[i];
    el.style.setProperty(
      "--fan-transform",
      `translateX(calc(-50% + ${x}px)) translateY(${y}px) rotate(${angle}deg)`,
    );
  }
};

const renderEnemyHand = () => {
  if (!elements.enemyHandArea) return;
  elements.enemyHandArea.innerHTML = "";
  state.enemy.hand.forEach((_, index) => {
    const back = document.createElement("div");
    back.className = "card-back";
    back.style.zIndex = String(index + 1);
    elements.enemyHandArea.appendChild(back);
  });
  layoutHandFan(elements.enemyHandArea, {
    direction: "up",
    angleSign: -1,
    maxAngle: 18,
    spreadX: 46,
    liftY: 20,
  });
};

const removeCardById = (cards, cardId) => {
  const index = cards.findIndex((c) => c.id === cardId);
  if (index === -1) return null;
  return cards.splice(index, 1)[0];
};

const tryDropPlayFromPlayer = (card) => {
  if (!card) return false;
  if (state.phase !== "メインフェイズ") {
    log("メインフェイズでのみ行動できます");
    return false;
  }
  if (state.handLimit.active) {
    log("手札調整中です");
    return false;
  }
  const decl = meetsDeclarationForCard(state.player, card);
  if (!decl.ok) {
    log(decl.reason);
    return false;
  }
  if (!canPlayCard(state.player, card)) {
    log(getCannotPlayReason(state.player, card) || "魂条件またはコストが足りない");
    return false;
  }
  playCard(state.player, state.enemy, card, "自分");
  if (decl.needKey) {
    consumeMainSubphase(state.player, decl.needKey);
  }
  checkWinner();
  return true;
};

const setupDropZone = (element, onDrop) => {
  if (!element) return;
  element.classList.add("drop-target");
  // 子要素（画像/button等）の上でも確実にドロップできるよう、captureで先に preventDefault する
  element.addEventListener(
    "dragover",
    (e) => {
    e.preventDefault();
    element.classList.add("dragover");
    },
    { capture: true },
  );
  element.addEventListener("dragleave", () => {
    element.classList.remove("dragover");
  });
  element.addEventListener(
    "drop",
    (e) => {
    e.preventDefault();
    element.classList.remove("dragover");
    const raw = e.dataTransfer?.getData("text/plain");
    if (!raw) return;
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = null;
    }
    if (!payload || typeof payload.cardId !== "string") return;
    onDrop(payload, e);
    },
    { capture: true },
  );
};

const initDragAndDrop = () => {
  const isLocationIdOnBoard = (fighter, locationId) => {
    if (!locationId) return false;
    if (fighter?.seasonTop?.id === locationId) return true;
    const field = Array.isArray(fighter?.field) ? fighter.field : fighter?.field ? [fighter.field] : [];
    return field.some((c) => c?.id === locationId);
  };

  const resolvePossessTargetId = (fighter, dropEvent) => {
    const el = dropEvent?.target?.closest?.("[data-field-cardid]");
    const fromHover = el?.dataset?.fieldCardid || "";
    if (fromHover && isLocationIdOnBoard(fighter, fromHover)) return fromHover;
    const chosen = state.ui?.possessTargetId || "";
    if (chosen && isLocationIdOnBoard(fighter, chosen)) return chosen;
    const selected = state.ui?.selectedFieldCardId || "";
    if (selected && isLocationIdOnBoard(fighter, selected)) return selected;
    // 直近の場札（最後に出した）を優先
    const lastField = Array.isArray(fighter.field) && fighter.field.length > 0
      ? fighter.field[fighter.field.length - 1]
      : null;
    if (lastField?.id) return lastField.id;
    // 季節札の上があればそこ
    if (fighter.seasonTop?.id) return fighter.seasonTop.id;
    return "";
  };

  // 手札 → 自分の場（場所札召喚 / 怪異札憑依 / 季節札展開）
  setupDropZone(elements.playerField, ({ from, cardId }, e) => {
    if (state.turn !== "player" || state.gameOver) {
      log("今は自分のターンではありません");
      render();
      return;
    }
    if (state.phase !== "メインフェイズ") {
      log("メインフェイズでのみ行動できます");
      render();
      return;
    }
    if (state.handLimit.active) {
      log("手札調整中です");
      render();
      return;
    }
    const origin = from === "openHand" ? state.player.openHand : state.player.hand;
    const card = removeCardById(origin, cardId);
    if (!card) return;
    const decl = meetsDeclarationForCard(state.player, card);
    if (!decl.ok) {
      log(decl.reason);
      origin.push(card);
      render();
      return;
    }

    // 怪異札：場所札に裏向きで憑依（コスト未達でも憑依自体は可能）
    if (card.attribute === "怪異札") {
      const targetId = resolvePossessTargetId(state.player, e);
      if (!targetId) {
        // 憑依先を失った扱い：手札公開場へ
        state.player.openHand.push(card);
        log("憑依先が無いので怪異札を手札公開場に置いた");
        render();
        return;
      }
      if (!isLocationIdOnBoard(state.player, targetId)) {
        state.player.openHand.push(card);
        log("憑依先を失ったので怪異札を手札公開場に置いた");
        render();
        return;
      }
      const ok = attachPossession(state.player, targetId, card);
      if (!ok) {
        state.player.openHand.push(card);
        log("憑依先を失ったので怪異札を手札公開場に置いた");
        render();
        return;
      }
      log(`怪異札（${card.name}）を裏向きで憑依した: ${targetId}`);
      if (decl.needKey) consumeMainSubphase(state.player, decl.needKey);
      state.ui.possessSelecting = false;
      state.ui.possessTargetId = "";
      render();
      return;
    }

    // 季節札：展開（場の季節スロットにも反映される）
    if (card.attribute === "季節札") {
      if (!canPlayCard(state.player, card)) {
        log(getCannotPlayReason(state.player, card) || "魂条件またはコストが足りない");
        origin.push(card);
        render();
        return;
      }
      playCard(state.player, state.enemy, card, "自分");
      if (decl.needKey) consumeMainSubphase(state.player, decl.needKey);
      checkWinner();
      render();
      return;
    }

    // 場所札：場に召喚（伏せ）
    if (card.attribute === "場所札") {
      if (!canPlayCard(state.player, card)) {
        log(getCannotPlayReason(state.player, card) || "魂条件またはコストが足りない");
        origin.push(card);
        render();
        return;
      }
      card.facedown = false;
      card.set = true;
      card.sleeping = false;
      state.player.field.push(card);
      const detail = (card.summonEffect ?? card.effect)?.(state.player, state.enemy);
      log(`自分が${card.name}を召喚: ${detail || "（効果なし）"}`);
      if (decl.needKey) consumeMainSubphase(state.player, decl.needKey);
      checkWinner();
      render();
      return;
    }

    // その他は戻す
    origin.push(card);
    render();
  });

  // 手札 → 季節札スロット（季節札展開 / 季節札の上に場所札を召喚 / 上の場所札へ怪異札憑依）
  setupDropZone(elements.playerSeasonArea, ({ from, cardId }, e) => {
    if (state.turn !== "player" || state.gameOver) {
      log("今は自分のターンではありません");
      render();
      return;
    }
    if (state.phase !== "メインフェイズ") {
      log("メインフェイズでのみ行動できます");
      render();
      return;
    }
    if (state.handLimit.active) {
      log("手札調整中です");
      render();
      return;
    }
    const origin = from === "openHand" ? state.player.openHand : state.player.hand;
    const card = removeCardById(origin, cardId);
    if (!card) return;
    const decl = meetsDeclarationForCard(state.player, card);
    if (!decl.ok) {
      log(decl.reason);
      origin.push(card);
      render();
      return;
    }

    // 怪異札：季節上の場所札に憑依（あれば）
    if (card.attribute === "怪異札") {
      const targetId = resolvePossessTargetId(state.player, e) || (state.player.seasonTop?.id ?? "");
      if (!targetId) {
        state.player.openHand.push(card);
        log("憑依先が無いので怪異札を手札公開場に置いた");
        render();
        return;
      }
      if (!isLocationIdOnBoard(state.player, targetId)) {
        state.player.openHand.push(card);
        log("憑依先を失ったので怪異札を手札公開場に置いた");
        render();
        return;
      }
      const ok = attachPossession(state.player, targetId, card);
      if (!ok) {
        state.player.openHand.push(card);
        log("憑依先を失ったので怪異札を手札公開場に置いた");
        render();
        return;
      }
      log(`怪異札（${card.name}）を裏向きで憑依した: ${targetId}`);
      if (decl.needKey) consumeMainSubphase(state.player, decl.needKey);
      state.ui.possessSelecting = false;
      state.ui.possessTargetId = "";
      render();
      return;
    }

    // 季節札：展開（既存は魂、上の場所札も魂）
    if (card.attribute === "季節札") {
      if (!canPlayCard(state.player, card)) {
        log(getCannotPlayReason(state.player, card) || "魂条件またはコストが足りない");
        origin.push(card);
        render();
        return;
      }
      playCard(state.player, state.enemy, card, "自分");
      if (decl.needKey) consumeMainSubphase(state.player, decl.needKey);
      checkWinner();
      render();
      return;
    }

    // 場所札：季節札の上に1枚だけ召喚
    if (card.attribute === "場所札") {
      if (!state.player.seasonField) {
        log("季節札が場にありません");
        origin.push(card);
        render();
        return;
      }
      // 右下の「上スロット」を狙って落とした場合は、必ず上へ
      const wantsTop = Boolean(e?.target?.closest?.("[data-season-top-slot='1']"));
      if (wantsTop && state.player.seasonTop) {
        log("季節札の上には【場所札】を1枚までしか召喚できません");
        origin.push(card);
        render();
        return;
      }
      if (!canPlayCard(state.player, card)) {
        log(getCannotPlayReason(state.player, card) || "魂条件またはコストが足りない");
        origin.push(card);
        render();
        return;
      }
      card.facedown = false;
      card.set = true;
      card.sleeping = false;
      if (wantsTop || !state.player.seasonTop) {
        // 上が空いている（または上スロット狙い）なら上へ
        if (state.player.seasonTop) {
          // wantsTop=false でここに来ることはないが、念のため
          log("季節札の上には【場所札】を1枚までしか召喚できません");
          origin.push(card);
          render();
          return;
        }
        state.player.seasonTop = card;
        const detail = (card.summonEffect ?? card.effect)?.(state.player, state.enemy);
        log(`自分が${card.name}を季節札の上に召喚: ${detail || "（効果なし）"}`);
      } else {
        // 上が埋まっている場合は場へ（季節札が展開されていても通常召喚できる）
        if (!Array.isArray(state.player.field)) state.player.field = [];
        state.player.field.push(card);
        const detail = (card.summonEffect ?? card.effect)?.(state.player, state.enemy);
        log(`自分が${card.name}を召喚: ${detail || "（効果なし）"}（季節札の上が埋まっているため場へ）`);
      }
      if (decl.needKey) consumeMainSubphase(state.player, decl.needKey);
      checkWinner();
      render();
      return;
    }

    origin.push(card);
    render();
  });

  // 手札/公開手札 → 公開手札
  setupDropZone(elements.openHandArea, ({ from, cardId }) => {
    if (state.turn !== "player" || state.gameOver) return;
    if (state.phase !== "メインフェイズ" || state.handLimit.active) return;
    if (from === "openHand") return;
    const card = removeCardById(state.player.hand, cardId);
    if (!card) return;
    state.player.openHand.push(card);
    log(`${card.name}を手札公開場に置いた`);
    render();
  });

  // 公開手札 → 手札へ戻す（上限5枚）
  setupDropZone(elements.handArea, ({ from, cardId }) => {
    if (state.turn !== "player" || state.gameOver) return;
    if (state.phase !== "メインフェイズ" || state.handLimit.active) return;
    if (from !== "openHand") return;
    const card = removeCardById(state.player.openHand, cardId);
    if (!card) return;
    state.player.hand.push(card);
    log(`${card.name}を手札に戻した`);
    render();
  });

  // 手札 → 魂（道具札の使用）
  setupDropZone(elements.playerSoulArea, ({ from, cardId }) => {
    if (state.turn !== "player" || state.gameOver) return;
    if (state.phase !== "メインフェイズ" || state.handLimit.active) return;
    if (from !== "hand") return;
    const card = removeCardById(state.player.hand, cardId);
    if (!card) return;
    const decl = meetsDeclarationForCard(state.player, card);
    if (!decl.ok) {
      log(decl.reason);
      state.player.hand.push(card);
      render();
      return;
    }
    if (card.attribute !== "道具札") {
      log("ここで使えるのは道具札のみです");
      state.player.hand.push(card);
      render();
      return;
    }
    if (!canPlayCard(state.player, card)) {
      log("魂条件またはコストが足りない");
      state.player.hand.push(card);
      render();
      return;
    }
    playCard(state.player, state.enemy, card, "自分");
    checkWinner();
    render();
  });
};

const renderSeasonArea = (fighter, element, selectedId) => {
  if (!element) return;
  const season = fighter?.seasonField ?? null;
  if (!season) {
    // 季節札が無いのに上の札が残っていたら崩れるのでリセット
    if (fighter) fighter.seasonTop = null;
    element.innerHTML = "";
    return;
  }
  const image = season.imageUrl
    ? `<img class="card-image" src="${season.imageUrl}" alt="${season.name}" />`
    : "";
  const top = fighter?.seasonTop ?? null;
  const topHtml = top
    ? renderFieldCard(top, selectedId, {
        wrapperClass: "season-top-card",
        possessionCount: getPossessionCount(fighter, top.id),
        attackable: state.ui?.attackSelecting && isAttackableLocationCard(top),
      })
    : `<button type="button" class="season-top-card season-top-card--empty" data-season-top-slot="1" aria-label="季節札の上の場所札（ここをクリック/ドロップで召喚）"></button>`;
  element.innerHTML = `
    <div class="season-stack">
      <div class="season-card">
      ${image}
      </div>
      ${topHtml}
    </div>
  `;
};

const renderHand = () => {
  elements.handArea.innerHTML = "";
  state.player.hand.forEach((card, index) => {
    const button = document.createElement("button");
    button.className = "card";
    button.type = "button";
    button.draggable =
      state.turn === "player" &&
      !state.gameOver &&
      state.phase === "メインフェイズ" &&
      !state.handLimit.active;
    button.disabled =
      state.turn !== "player" ||
      state.gameOver ||
      (state.phase !== "メインフェイズ" && !state.handLimit.active);
    button.dataset.cardId = card.id;
    button.style.zIndex = String(index + 1);
    if (state.ui?.selectedHandCardId === card.id && state.ui?.selectedHandFrom === "hand") {
      button.classList.add("card--play-selected");
    }
    if (state.mulligan.selection.has(card.id)) {
      button.classList.add("selected");
    }
    if (state.handLimit.active && state.handLimit.selection.has(`hand:${card.id}`)) {
      button.classList.add("selected");
    }
    const image = card.imageUrl
      ? `<img class="card-image" src="${card.imageUrl}" alt="${card.name}" />`
      : "";
    button.innerHTML = `
      ${image}
    `;
    button.addEventListener("dragstart", (e) => {
      if (state.gameOver) return;
      e.dataTransfer?.setData(
        "text/plain",
        JSON.stringify({ from: "hand", cardId: card.id }),
      );
      if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
    });
    button.addEventListener("click", (e) => {
      if (state.turn !== "player" || state.gameOver) return;
      if (state.handLimit.active) {
        const key = `hand:${card.id}`;
        if (state.handLimit.selection.has(key)) {
          state.handLimit.selection.delete(key);
        } else {
          state.handLimit.selection.add(key);
        }
        render();
        return;
      }
      if (state.mulligan.active) {
        const shift = Boolean(e?.shiftKey);
        const has = state.mulligan.selection.has(card.id);
        // クリック順＝山札下へ置く順番（Setの挿入順）として扱う。
        // - 通常クリック: 未選択→追加 / 選択済→末尾へ移動（順番調整）
        // - Shift+クリック: 選択のON/OFF
        if (shift) {
          if (has) state.mulligan.selection.delete(card.id);
          else state.mulligan.selection.add(card.id);
        } else {
          if (has) state.mulligan.selection.delete(card.id);
          state.mulligan.selection.add(card.id);
        }
        render();
        return;
      }
      // 以降は「出す札」を選択（クリックだけで即プレイしない）
      if (state.phase !== "メインフェイズ" || state.handLimit.active) return;
      if (state.ui.selectedHandCardId === card.id && state.ui.selectedHandFrom === "hand") {
        clearHandSelection();
        render();
        return;
      }
      state.ui.selectedHandCardId = card.id;
      state.ui.selectedHandFrom = "hand";
      if (card.attribute === "怪異札") {
        state.ui.possessSelecting = true;
        state.ui.possessTargetId = "";
        log("怪異札を選択。憑依先の【場所札】をクリックしてください");
      } else {
        state.ui.possessSelecting = false;
        state.ui.possessTargetId = "";
        log("札を選択。出したい場所（場/季節/魂）をクリックしてください");
      }
      render();
    });
    elements.handArea.appendChild(button);
  });
  layoutHandFan(elements.handArea, {
    direction: "down",
    maxAngle: 22,
    spreadX: 60,
    liftY: 26,
  });
};

const renderOpenHand = () => {
  elements.openHandArea.innerHTML = "";
  state.player.openHand.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.draggable =
      state.turn === "player" &&
      !state.gameOver &&
      state.phase === "メインフェイズ" &&
      !state.handLimit.active;
    cardDiv.dataset.cardId = card.id;
    if (state.ui?.selectedHandCardId === card.id && state.ui?.selectedHandFrom === "openHand") {
      cardDiv.classList.add("card--play-selected");
    }
    if (state.handLimit.active && state.handLimit.selection.has(`openHand:${card.id}`)) {
      cardDiv.classList.add("selected");
    }
    const image = card.imageUrl
      ? `<img class="card-image" src="${card.imageUrl}" alt="${card.name}" />`
      : "";
    cardDiv.innerHTML = `
      ${image}
    `;
    cardDiv.addEventListener("dragstart", (e) => {
      if (state.gameOver) return;
      e.dataTransfer?.setData(
        "text/plain",
        JSON.stringify({ from: "openHand", cardId: card.id }),
      );
      if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
    });
    cardDiv.addEventListener("click", () => {
      if (state.turn !== "player" || state.gameOver) return;
      if (state.handLimit.active) {
        const key = `openHand:${card.id}`;
        if (state.handLimit.selection.has(key)) {
          state.handLimit.selection.delete(key);
        } else {
          state.handLimit.selection.add(key);
        }
        render();
        return;
      }
      // 出す札の選択
      if (state.phase !== "メインフェイズ") return;
      if (state.ui.selectedHandCardId === card.id && state.ui.selectedHandFrom === "openHand") {
        clearHandSelection();
        render();
        return;
      }
      state.ui.selectedHandCardId = card.id;
      state.ui.selectedHandFrom = "openHand";
      if (card.attribute === "怪異札") {
        state.ui.possessSelecting = true;
        state.ui.possessTargetId = "";
        log("怪異札を選択。憑依先の【場所札】をクリックしてください");
      } else {
        state.ui.possessSelecting = false;
        state.ui.possessTargetId = "";
        log("札を選択。出したい場所（場/季節/魂）をクリックしてください");
      }
      render();
    });
    elements.openHandArea.appendChild(cardDiv);
  });
};

const renderFieldCard = (card, selectedId, meta) => {
  if (!card) return "";
  const possessionCount = Number(meta?.possessionCount ?? 0) || 0;
  const possessionVisible = Array.isArray(meta?.possessionVisible) ? meta.possessionVisible : [];
  const wrapperClass = meta?.wrapperClass ? ` ${meta.wrapperClass}` : "";
  const selected = card.id && card.id === selectedId ? " field-card--selected" : "";
  const possessTarget = card.id && card.id === state.ui?.possessTargetId ? " field-card--possess-target" : "";
  const attackable = meta?.attackable ? " field-card--attackable" : "";
  const data = card.id ? ` data-field-cardid="${card.id}"` : "";
  const possessedClass = possessionCount > 0 ? " field-card--possessed" : "";
  const possessionUnder =
    possessionCount > 0
      ? `
        <div class="possession-under" aria-hidden="true">
          ${possessionVisible
            .map(
              (_c, i) =>
                `<div class="card-back possession-under-card" style="--pos-i:${i}"></div>`,
            )
            .join("")}
        </div>
        <div class="possession-badge" aria-label="憑依札">${possessionCount}</div>
      `
      : "";
  if (card.facedown) {
    return `
      <div class="field-card card-facedown${selected}${possessTarget}${attackable}${wrapperClass}${possessedClass}"${data}>
        <div class="field-card-face" aria-label="裏向きカード">
          <div class="card-back card-back--field" aria-hidden="true"></div>
          ${possessionUnder}
        </div>
      </div>
    `;
  }
  const image = card.imageUrl
    ? `<img class="card-image" src="${card.imageUrl}" alt="${card.name}" />`
    : "";
  const setClass = card.set || card.sleeping ? " card-set" : "";
  return `
    <div class="field-card${setClass}${selected}${possessTarget}${attackable}${wrapperClass}${possessedClass}"${data}>
      <div class="field-card-face">
        ${image}
        ${possessionUnder}
      </div>
    </div>
  `;
};

const renderFieldCards = (fighter, field, selectedId) => {
  const cards = Array.isArray(field) ? field : field ? [field] : [];
  if (cards.length === 0) return "";
  return cards
    .map((c) =>
      renderFieldCard(c, selectedId, {
        possessionCount: c?.id ? getPossessionList(fighter, c.id).length : 0,
        possessionVisible: c?.id ? getPossessionList(fighter, c.id).slice(-3) : [],
        attackable: state.ui?.attackSelecting && isAttackableLocationCard(c),
      }),
    )
    .join("");
};

const render = () => {
  elements.playerHp && (elements.playerHp.textContent = String(state.player.hp));
  elements.enemyHp && (elements.enemyHp.textContent = String(state.enemy.hp));
  elements.deckCount && (elements.deckCount.textContent = String(state.player.deck.length));
  elements.enemyDeckCount && (elements.enemyDeckCount.textContent = String(state.enemy.deck.length));

  renderBanishArea(state.player, elements.banishArea);
  renderBanishArea(state.enemy, elements.enemyBanishArea);

  elements.playerField &&
    (elements.playerField.innerHTML = renderFieldCards(
      state.player,
      state.player.field,
      state.ui?.selectedFieldCardId,
    ));
  elements.enemyField &&
    (elements.enemyField.innerHTML = renderFieldCards(state.enemy, state.enemy.field, ""));

  renderSeasonArea(state.player, elements.playerSeasonArea, state.ui?.selectedFieldCardId);
  renderSeasonArea(state.enemy, elements.enemySeasonArea, "");
  elements.logArea && (elements.logArea.innerHTML = state.logs.map((l) => `<div>${l}</div>`).join(""));

  // 勝利オーバーレイ
  if (elements.resultOverlay) {
    const show = Boolean(state.gameOver && state.result?.kind);
    elements.resultOverlay.classList.toggle("result-overlay--show", show);
    elements.resultOverlay.classList.toggle("result-overlay--player", state.result?.kind === "player");
    elements.resultOverlay.classList.toggle("result-overlay--enemy", state.result?.kind === "enemy");
    elements.resultOverlay.classList.toggle("result-overlay--draw", state.result?.kind === "draw");
    elements.resultOverlay.setAttribute("aria-hidden", show ? "false" : "true");
    if (elements.resultTitle) elements.resultTitle.textContent = state.result?.title || "";
    if (elements.resultSubtitle) elements.resultSubtitle.textContent = state.result?.subtitle || "";
  }
  elements.endBtn &&
    (elements.endBtn.disabled =
      state.turn !== "player" || state.gameOver || state.handLimit.active);
  elements.mulliganBtn &&
    (elements.mulliganBtn.disabled = state.mulligan.used || state.turnNumber !== 1);
  elements.mulliganConfirmBtn &&
    (elements.mulliganConfirmBtn.disabled = !state.mulligan.active);
  if (elements.phaseLabel) {
    elements.phaseLabel.textContent = state.phase;
  }

  if (elements.declareLocationSummon) {
    elements.declareLocationSummon.disabled = Boolean(state.player?.mainUsed?.locationSummon);
  }
  if (elements.declareLocationAttack) {
    elements.declareLocationAttack.disabled = Boolean(state.player?.mainUsed?.locationAttack);
  }
  if (elements.declareAnomalyPossess) {
    elements.declareAnomalyPossess.disabled = Boolean(state.player?.mainUsed?.anomalyPossess);
  }
  if (elements.declareSeasonDeploy) {
    elements.declareSeasonDeploy.disabled = Boolean(state.player?.mainUsed?.seasonDeploy);
  }
  if (elements.declareToolUse) {
    elements.declareToolUse.disabled =
      state.turn !== "player" ||
      state.gameOver ||
      state.phase !== "メインフェイズ" ||
      state.handLimit.active ||
      !canUseToolNow(state.player);
  }

  // 手札調整中は「ターン終了」ボタンが確定ボタンを兼ねる
  if (elements.endBtn) {
    if (state.handLimit.active) {
      const ok = state.handLimit.selection.size >= state.handLimit.needed;
      elements.endBtn.textContent = ok ? "手札調整確定" : `手札調整（残り${state.handLimit.needed - state.handLimit.selection.size}）`;
      elements.endBtn.disabled = !ok;
    } else {
      elements.endBtn.textContent = "ターン終了";
      elements.endBtn.disabled = state.turn !== "player" || state.gameOver;
    }
  }

  // クイック操作（手札付近）の同期
  if (elements.quickAttackBtn) {
    elements.quickAttackBtn.disabled = Boolean(elements.attackBtn?.disabled);
    elements.quickAttackBtn.textContent = elements.attackBtn?.textContent || "攻撃";
  }
  if (elements.quickEndBtn) {
    elements.quickEndBtn.disabled = Boolean(elements.endBtn?.disabled);
    elements.quickEndBtn.textContent = elements.endBtn?.textContent || "ターン終了";
  }
  renderSoulArea(state.player, elements.playerSoulArea);
  renderSoulArea(state.enemy, elements.enemySoulArea);
  renderEnemyHand();
  renderOpenHand();
  renderHand();
};

const setLogCollapsed = (collapsed) => {
  const next = Boolean(collapsed);
  elements.logSection?.classList.toggle("log--collapsed", next);
  if (elements.logToggle) {
    elements.logToggle.textContent = next ? "展開" : "縮小";
  }
};

const setBgmCollapsed = (collapsed) => {
  const next = Boolean(collapsed);
  elements.bgmSection?.classList.toggle("bgm--collapsed", next);
  if (elements.bgmCollapse) {
    elements.bgmCollapse.textContent = next ? "展開" : "縮小";
  }
};

elements.resetBtn.addEventListener("click", resetGame);
elements.resultReset?.addEventListener("click", resetGame);
elements.logToggle?.addEventListener("click", () => {
  const collapsed = elements.logSection?.classList.contains("log--collapsed") ?? false;
  setLogCollapsed(!collapsed);
});
elements.bgmCollapse?.addEventListener("click", () => {
  const collapsed = elements.bgmSection?.classList.contains("bgm--collapsed") ?? false;
  setBgmCollapsed(!collapsed);
});
elements.mulliganBtn.addEventListener("click", () => {
  if (state.mulligan.used || state.turnNumber !== 1) return;
  state.mulligan.active = !state.mulligan.active;
  if (!state.mulligan.active) {
    state.mulligan.selection.clear();
    log("零探しを中断");
  } else {
    log("零探しします（入れ替える札をクリック。順番を変えるにはもう一度クリック / 外すにはShift+クリック）");
  }
  render();
});
elements.mulliganConfirmBtn.addEventListener("click", () => {
  if (!state.mulligan.active || state.mulligan.used) return;
  const selectedIds = Array.from(state.mulligan.selection);
  if (selectedIds.length > 0) {
    // Setの挿入順＝山札の一番下に置く順（= 後で到達したときに先に引く順）として扱う
    const returning = selectedIds
      .map((id) => state.player.hand.find((c) => c.id === id) || null)
      .filter(Boolean);
    state.player.hand = state.player.hand.filter((c) => !state.mulligan.selection.has(c.id));
    returning.forEach((card) => state.player.deck.push(card));
    returning.forEach(() => drawCard(state.player, "自分"));
    log(`零探しで手札を入れ替えた（${returning.length}枚）`);
  } else {
    log("零探しをスキップ");
  }
  state.mulligan.used = true;
  state.mulligan.active = false;
  state.mulligan.selection.clear();
  render();
});

// 【怪異札】憑依：対象選択モード
elements.declareAnomalyPossess?.addEventListener("click", () => {
  if (state.turn !== "player" || state.gameOver) return;
  if (state.phase !== "メインフェイズ") {
    log("メインフェイズでのみ行動できます");
    render();
    return;
  }
  if (state.handLimit.active) return;
  if (state.player.mainUsed.anomalyPossess) {
    log("【怪異札】憑依はこのターンすでに使用しています");
    render();
    return;
  }
  state.ui.possessSelecting = !state.ui.possessSelecting;
  if (!state.ui.possessSelecting) {
    state.ui.possessTargetId = "";
  } else {
    log("憑依先の【場所札】をクリックで選択してください（選択後、怪異札を場へドラッグ）");
  }
  render();
});

// 【道具札】発動（宣言）
elements.declareToolUse?.addEventListener("click", () => {
  if (state.turn !== "player" || state.gameOver) return;
  if (state.phase !== "メインフェイズ") {
    log("メインフェイズでのみ行動できます");
    render();
    return;
  }
  if (state.handLimit.active) return;
  if (!canUseToolNow(state.player)) {
    log("この間、道具札は使用できません");
    render();
    return;
  }
  log("【道具札】発動を宣言。道具札を選択して「魂」をクリック（または魂へドラッグ）してください");
  render();
});

// 場（場所札）クリックで攻撃対象を選択
elements.playerField?.addEventListener("click", (e) => {
  if (state.turn !== "player" || state.gameOver) return;
  if (state.handLimit.active) return;
  const picked = getSelectedHandCard();
  const target = e.target?.closest?.("[data-field-cardid]");
  const id = target?.dataset?.fieldCardid || "";

  // 攻撃選択モード中は「攻撃できる札」だけ選択
  if (!picked && state.ui.attackSelecting) {
    if (!id) return;
    const loc = getAllLocationCards(state.player).find((x) => x.card?.id === id)?.card ?? null;
    if (!isAttackableLocationCard(loc)) {
      log("その場所札は攻撃できません（伏せ/裏向き）");
      render();
      return;
    }
    state.ui.selectedFieldCardId = state.ui.selectedFieldCardId === id ? "" : id;
    render();
    return;
  }

  // 手札選択がある場合：クリック先に応じてプレイ処理
  if (picked) {
    const { card } = picked;
    // 怪異札：場所札クリックで憑依確定
    if (card.attribute === "怪異札") {
      if (!id) {
        log("憑依先の【場所札】をクリックしてください");
        render();
        return;
      }
      const decl = meetsDeclarationForCard(state.player, card);
      if (!decl.ok) {
        log(decl.reason);
        render();
        return;
      }
      // 手札から取り除いて憑依
      const origin = picked.origin;
      const removed = removeCardById(origin, card.id);
      if (!removed) return;
      if (!attachPossession(state.player, id, removed)) {
        state.player.openHand.push(removed);
        log("憑依先を失ったので怪異札を手札公開場に置いた");
        clearHandSelection();
        render();
        return;
      }
      log(`怪異札（${removed.name}）を裏向きで憑依した: ${id}`);
      if (decl.needKey) consumeMainSubphase(state.player, decl.needKey);
      clearHandSelection();
      render();
      return;
    }

    // 場所札：場へ召喚（クリックで確定）
    if (card.attribute === "場所札") {
      const decl = meetsDeclarationForCard(state.player, card);
      if (!decl.ok) {
        log(decl.reason);
        render();
        return;
      }
      if (!canPlayCard(state.player, card)) {
        log(getCannotPlayReason(state.player, card) || "魂条件またはコストが足りない");
        render();
        return;
      }
      const removed = removeCardById(picked.origin, card.id);
      if (!removed) return;
      removed.facedown = false;
      removed.set = true;
      removed.sleeping = false;
      state.player.field.push(removed);
      const detail = (removed.summonEffect ?? removed.effect)?.(state.player, state.enemy);
      log(`自分が${removed.name}を召喚: ${detail || "（効果なし）"}`);
      if (decl.needKey) consumeMainSubphase(state.player, decl.needKey);
      clearHandSelection();
      checkWinner();
      render();
      return;
    }

    // 季節札/道具札はここでは確定しない（季節/魂をクリック）
  }

  // 手札選択が無い場合：従来どおり攻撃対象選択
  if (!target) return;
  if (!id) return;
  state.ui.selectedFieldCardId = state.ui.selectedFieldCardId === id ? "" : id;
  render();
});

// 季節札の上の場所札もクリック選択できるように
elements.playerSeasonArea?.addEventListener("click", (e) => {
  if (state.turn !== "player" || state.gameOver) return;
  if (state.handLimit.active) return;
  const picked = getSelectedHandCard();
  const target = e.target?.closest?.("[data-field-cardid]");
  const id = target?.dataset?.fieldCardid || "";

  // 攻撃選択モード中は「攻撃できる札」だけ選択
  if (!picked && state.ui.attackSelecting) {
    if (!id) return;
    const loc = getAllLocationCards(state.player).find((x) => x.card?.id === id)?.card ?? null;
    if (!isAttackableLocationCard(loc)) {
      log("その場所札は攻撃できません（伏せ/裏向き）");
      render();
      return;
    }
    state.ui.selectedFieldCardId = state.ui.selectedFieldCardId === id ? "" : id;
    render();
    return;
  }

  if (picked) {
    const { card } = picked;

    // 怪異札：季節上の場所札/クリックした場所札へ憑依
    if (card.attribute === "怪異札") {
      const targetId = id || state.player.seasonTop?.id || "";
      if (!targetId) {
        log("憑依先の【場所札】をクリックしてください");
        render();
        return;
      }
      const decl = meetsDeclarationForCard(state.player, card);
      if (!decl.ok) {
        log(decl.reason);
        render();
        return;
      }
      const removed = removeCardById(picked.origin, card.id);
      if (!removed) return;
      if (!attachPossession(state.player, targetId, removed)) {
        state.player.openHand.push(removed);
        log("憑依先を失ったので怪異札を手札公開場に置いた");
        clearHandSelection();
        render();
        return;
      }
      log(`怪異札（${removed.name}）を裏向きで憑依した: ${targetId}`);
      if (decl.needKey) consumeMainSubphase(state.player, decl.needKey);
      clearHandSelection();
      render();
      return;
    }

    // 季節札：展開（クリックで確定）
    if (card.attribute === "季節札") {
      const decl = meetsDeclarationForCard(state.player, card);
      if (!decl.ok) {
        log(decl.reason);
        render();
        return;
      }
      if (!canPlayCard(state.player, card)) {
        log(getCannotPlayReason(state.player, card) || "魂条件またはコストが足りない");
        render();
        return;
      }
      const removed = removeCardById(picked.origin, card.id);
      if (!removed) return;
      playCard(state.player, state.enemy, removed, "自分");
      if (decl.needKey) consumeMainSubphase(state.player, decl.needKey);
      clearHandSelection();
      checkWinner();
      render();
      return;
    }

    // 場所札：季節札の上に召喚（クリックで確定）
    if (card.attribute === "場所札") {
      if (!state.player.seasonField) {
        log("季節札が場にありません");
        render();
        return;
      }
      const decl = meetsDeclarationForCard(state.player, card);
      if (!decl.ok) {
        log(decl.reason);
        render();
        return;
      }
      if (!canPlayCard(state.player, card)) {
        log("魂条件またはコストが足りない");
        render();
        return;
      }
      const removed = removeCardById(picked.origin, card.id);
      if (!removed) return;
      removed.facedown = false;
      removed.set = true;
      removed.sleeping = false;
      if (state.player.seasonTop) {
        if (!Array.isArray(state.player.field)) state.player.field = [];
        state.player.field.push(removed);
        const detail = (removed.summonEffect ?? removed.effect)?.(state.player, state.enemy);
        log(`自分が${removed.name}を召喚: ${detail || "（効果なし）"}（季節札の上が埋まっているため場へ）`);
      } else {
        state.player.seasonTop = removed;
        const detail = (removed.summonEffect ?? removed.effect)?.(state.player, state.enemy);
        log(`自分が${removed.name}を季節札の上に召喚: ${detail || "（効果なし）"}`);
      }
      if (decl.needKey) consumeMainSubphase(state.player, decl.needKey);
      clearHandSelection();
      checkWinner();
      render();
      return;
    }
  }

  // 手札選択が無い場合：従来どおり攻撃対象選択
  if (!target) return;
  if (!id) return;
  state.ui.selectedFieldCardId = state.ui.selectedFieldCardId === id ? "" : id;
  render();
});
elements.attackBtn.addEventListener("click", () => {
  if (state.turn !== "player" || state.gameOver) return;
  if (state.phase !== "メインフェイズ") {
    log("メインフェイズでのみ攻撃できます");
    render();
    return;
  }
  if (state.handLimit.active) return;
  if (state.player.mainUsed.locationAttack) {
    log("【場所札】攻撃はこのターンすでに使用しています");
    render();
    return;
  }
  // 手札選択が残っていると事故るので解除
  if (state.ui.selectedHandCardId) {
    clearHandSelection();
  }

  const selectedId = state.ui?.selectedFieldCardId || "";
  const selectedCard = selectedId
    ? getAllLocationCards(state.player).find((x) => x.card?.id === selectedId)?.card ?? null
    : null;

  // 既に攻撃できる札が選択されているなら、即攻撃（最短操作）
  if (selectedCard && isAttackableLocationCard(selectedCard)) {
    // 道具札ロック：攻撃宣言時に使っていなければ、場所札が魂になるまで使えない
    const anyAttackable = getAllLocationCards(state.player).some((x) => isAttackableLocationCard(x.card));
    if (anyAttackable && state.player?.tool && !state.player.tool.usedInWindow) {
      state.player.tool.lockedUntilLocationSouls = true;
    }
    if (attackWithField(state.player, state.enemy, "自分", selectedId)) {
      consumeMainSubphase(state.player, "locationAttack");
      clearAttackSelection();
      // ライフが0になった瞬間に勝利表示
      checkWinner();
      render();
    }
    return;
  }

  // そうでなければ、攻撃選択モードへ（分かりやすさ優先）
  state.ui.attackSelecting = !state.ui.attackSelecting;
  if (!state.ui.attackSelecting) {
    log("攻撃選択を解除");
    state.ui.selectedFieldCardId = "";
    render();
    return;
  }
  log("攻撃する【場所札】をクリックで選んでください（もう一度「攻撃」でキャンセル）");
  state.ui.selectedFieldCardId = "";
  render();
  return;
});

// 道具札：選択 → 魂ゾーンをクリックで使用
elements.playerSoulArea?.addEventListener("click", () => {
  if (state.turn !== "player" || state.gameOver) return;
  if (state.handLimit.active) return;
  if (state.phase !== "メインフェイズ") return;
  const picked = getSelectedHandCard();
  if (!picked) return;
  const { card } = picked;
  if (card.attribute !== "道具札") return;
  const decl = meetsDeclarationForCard(state.player, card);
  if (!decl.ok) {
    log(decl.reason);
    render();
    return;
  }
  if (!canPlayCard(state.player, card)) {
    log(getCannotPlayReason(state.player, card) || "魂条件またはコストが足りない");
    render();
    return;
  }
  const removed = removeCardById(picked.origin, card.id);
  if (!removed) return;
  playCard(state.player, state.enemy, removed, "自分");
  clearHandSelection();
  checkWinner();
  render();
});
elements.endBtn.addEventListener("click", () => {
  if (state.turn !== "player" || state.gameOver) return;
  // 手札調整中なら、このボタンが確定になる
  if (state.handLimit.active) {
    const needed = state.handLimit.needed;
    const selected = Array.from(state.handLimit.selection).slice(0, needed);
    if (selected.length < needed) {
      log("手札調整の選択が足りません");
      render();
      return;
    }
    for (const key of selected) {
      const [from, cardId] = key.split(":");
      const origin = from === "openHand" ? state.player.openHand : state.player.hand;
      const card = removeCardById(origin, cardId);
      if (!card) continue;
      placeInSoul(state.player, card, "自分");
    }
    state.handLimit.active = false;
    state.handLimit.needed = 0;
    state.handLimit.selection.clear();
    enemyTurn();
    return;
  }

  state.phase = "エンドフェイズ";
  const total = getTotalHandCount(state.player);
  if (total >= 9) {
    state.handLimit.active = true;
    state.handLimit.needed = total - 8;
    state.handLimit.selection.clear();
    log(`手札が${total}枚です。${state.handLimit.needed}枚を魂に置いて8枚にしてください`);
    render();
    return;
  }
  enemyTurn();
});

// クイック操作（手札付近）→ 既存ボタンへ委譲
elements.quickAttackBtn?.addEventListener("click", () => {
  elements.attackBtn?.click();
});
elements.quickEndBtn?.addEventListener("click", () => {
  elements.endBtn?.click();
});


applyPlaymatSettings();
initBgmUi();
initBgmAutostart();
initDragAndDrop();
initDeckChoiceUi();
initMobileUi();
resetGame();
setLogCollapsed(false);
setBgmCollapsed(false);