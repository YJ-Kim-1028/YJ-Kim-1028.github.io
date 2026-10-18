// 32x32 픽셀 캐릭터: 도형으로 그린 뒤 윤곽선을 자동으로 두릅니다.
// 긴 갈색 생머리, 둥근 얼굴, 네이비 세미정장. DEV 모드에서는 안경을 씁니다.
const SIZE = 32;
const C = {
  K: "#1a1c2c", // 윤곽선
  H: "#6b4226", // 머리카락
  h: "#8f5f3a", // 머리카락 하이라이트
  S: "#f8e0d0", // 피부
  s: "#e6c2ae", // 피부 그림자
  P: "#f6a9a4", // 볼터치
  M: "#b5454f", // 입
  E: "#1a1c2c", // 눈
  W: "#ffffff", // 눈 하이라이트 / 셔츠
  B: "#2b3a67", // 재킷
  b: "#3b4d85", // 재킷 하이라이트
  D: "#3a3f5c", // 바지
  F: "#3a2f45", // 안경테
  L: "#cfe9ff", // 안경 렌즈
};

function buildSprite(glasses) {
  const g = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  const put = (x, y, c) => { if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) g[y][x] = c; };
  const rect = (x0, y0, x1, y1, c) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, c);
  };
  const ellipse = (cx, cy, rx, ry, c, test) => {
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1 && (!test || test(x, y))) put(x, y, c);
      }
    }
  };
  const mirror = (x) => SIZE - 1 - x;

  // 뒷머리 (긴 생머리)
  ellipse(16, 11, 10.5, 9, "H");
  rect(6, 11, 25, 21, "H");
  [[6, 21], [25, 21], [6, 20], [25, 20]].forEach(([x, y]) => put(x, y, null));

  // 얼굴
  ellipse(16, 13.5, 7.5, 7, "S");
  // 목
  rect(14, 20, 17, 21, "s");

  // 앞머리: 이마 전체를 덮는 일자 앞머리 (끝이 살짝 들쭉날쭉)
  for (let y = 5; y <= 11; y++) {
    for (let x = 8; x <= 23; x++) {
      if (g[y][x] !== "S") continue;
      const side = x <= 10 || x >= 21;
      if (y <= 9 || (y === 10 && (x % 3 !== 0 || side)) || (y === 11 && side)) {
        put(x, y, "H");
      }
    }
  }

  // 재킷 / 셔츠 / 손 / 바지
  rect(8, 22, 23, 28, "B");
  [[8, 22], [23, 22]].forEach(([x, y]) => put(x, y, null));
  rect(14, 22, 17, 22, "W");
  rect(15, 23, 16, 24, "W");
  rect(11, 23, 11, 27, "b"); rect(20, 23, 20, 27, "b");
  rect(7, 27, 7, 28, "S"); rect(24, 27, 24, 28, "S");
  rect(11, 29, 20, 30, "D");
  put(15, 30, null); put(16, 30, null);

  // 눈, 볼, 입
  [11, 19].forEach((x0) => {
    rect(x0, 13, x0 + 1, 15, "E");
    put(x0, 13, "W");
    put(x0 === 11 ? 11 : 19, 17, "P");
    put(x0 === 11 ? 12 : 20, 17, "P");
  });
  put(15, 18, "M"); put(16, 18, "M");

  // 안경: 렌즈 + 테 + 코받침 (눈은 렌즈 위에 그대로 보입니다)
  if (glasses) {
    [9, 17].forEach((x0) => {
      for (let y = 12; y <= 16; y++) {
        for (let x = x0; x <= x0 + 5; x++) {
          const edge = y === 12 || y === 16 || x === x0 || x === x0 + 5;
          const corner = (y === 12 || y === 16) && (x === x0 || x === x0 + 5);
          if (corner) continue;
          if (edge) put(x, y, "F");
          else if (g[y][x] === "S") put(x, y, "L");
        }
      }
    });
    put(15, 13, "F"); put(16, 13, "F");
    // 귀 쪽 다리
    put(8, 13, "F"); put(23, 13, "F");
  }

  // 머리카락 하이라이트
  [[11, 5], [12, 5], [13, 5], [10, 6], [18, 5], [19, 5], [9, 11], [9, 14], [9, 17],
   [22, 11], [22, 14], [22, 17]].forEach(([x, y]) => { if (g[y][x] === "H") put(x, y, "h"); });
  // 자동 윤곽선 (4방향 이웃이 채워져 있으면 K)
  const filled = g.map((row) => row.map((c) => c !== null));
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (filled[y][x]) continue;
      const n = (filled[y - 1] && filled[y - 1][x]) || (filled[y + 1] && filled[y + 1][x]) ||
                filled[y][x - 1] || filled[y][x + 1];
      if (n) g[y][x] = "K";
    }
  }
  return g;
}

(function drawSprites() {
  const sprites = { dev: buildSprite(true), design: buildSprite(false) };
  function draw() {
    const sprite = document.body.dataset.mode === "design" ? sprites.design : sprites.dev;
    document.querySelectorAll("canvas.sprite, #hero-sprite").forEach((canvas) => {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sprite.forEach((row, y) => {
        row.forEach((key, x) => {
          if (key) {
            ctx.fillStyle = C[key];
            ctx.fillRect(x, y, 1, 1);
          }
        });
      });
    });
  }
  draw();
  new MutationObserver(draw).observe(document.body, { attributes: true, attributeFilter: ["data-mode"] });
})();

// 스킬 바: 화면에 보이면 채워지는 애니메이션
(function animateSkills() {
  const skills = document.querySelectorAll(".skill");
  const fill = (el) => {
    el.querySelector("i").style.width = el.dataset.level + "%";
  };
  if (!("IntersectionObserver" in window)) {
    skills.forEach(fill);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        fill(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  skills.forEach((s) => io.observe(s));
})();

// 보기 방식: 모든 내용은 항상 보이고, 링크의 ?mode=design / ?mode=dev 로 강조할 쪽을 먼저 보여 줍니다
// (링크에 mode가 없으면 기획 → 개발 순서의 기본 화면)
(function modeSwitch() {
  const MODES = ["dev", "design"];
  const fromUrl = new URLSearchParams(location.search).get("mode");
  const mode = MODES.includes(fromUrl) ? fromUrl : null;

  // data-mode는 소개 문구와 캐릭터 그림을 고르는 데만 씁니다 (기본은 dev)
  document.body.dataset.mode = mode || "dev";
  document.title = (mode === "design" ? "게임 기획자" : mode === "dev" ? "게임 개발자" : "게임 기획·개발") + " 포트폴리오";

  // 스킬: dev면 GAME이 먼저, 그 외에는 PLANNING이 먼저
  const plan = document.getElementById("skills-plan");
  const game = document.getElementById("skills-game");
  if (plan && game && plan.parentNode === game.parentNode) {
    plan.parentNode.insertBefore(mode === "dev" ? game : plan, mode === "dev" ? plan : game);
  }
})();

// 캐릭터 장면 카드: ▶ 로 넘기면 배경과 말풍선이 바뀝니다 (타자기 효과)
(function talkCard() {
  const scene = document.getElementById("talk");
  const text = document.getElementById("talk-text");
  const label = document.getElementById("scene-label");
  const sub = document.getElementById("scene-sub");
  const board = document.getElementById("scene-board");
  const bg = document.getElementById("scene-bg");
  const bubble = scene && scene.querySelector(".bubble");
  const prev = document.getElementById("talk-prev");
  const next = document.getElementById("talk-next");
  const dots = document.getElementById("talk-dots");
  const script = document.querySelector(".talk-script");
  if (!scene || !text || !script) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;
  let timer = null;

  // 현재 모드에서 보이는 대사만 사용 (DEV/DESIGN 전환 대응)
  function visibleLines() {
    const design = document.body.dataset.mode === "design";
    return [...script.children].filter((li) =>
      !(design && li.classList.contains("only-dev")) &&
      !(!design && li.classList.contains("only-design")));
  }

  function renderDots(total) {
    dots.textContent = "";
    for (let i = 0; i < total; i++) {
      const d = document.createElement("i");
      if (i === index) d.className = "on";
      dots.appendChild(d);
    }
  }

  // 텍스트 노드를 비운 뒤 글자 수만큼 채워 가는 타자기 효과
  function typewriter(el) {
    const nodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) nodes.push([walker.currentNode, walker.currentNode.nodeValue]);
    const total = nodes.reduce((sum, [, str]) => sum + str.length, 0);
    nodes.forEach(([node]) => { node.nodeValue = ""; });
    let shown = 0;
    timer = setInterval(() => {
      shown++;
      let left = shown;
      nodes.forEach(([node, str]) => {
        node.nodeValue = str.slice(0, Math.max(0, Math.min(str.length, left)));
        left -= str.length;
      });
      if (shown >= total) clearInterval(timer);
    }, 28);
  }

  function show(i) {
    const all = visibleLines();
    index = Math.max(0, Math.min(i, all.length - 1));
    clearInterval(timer);
    renderDots(all.length);
    const li = all[index];
    const last = index === all.length - 1;
    prev.disabled = index === 0;
    next.disabled = last;

    // 배경 / 라벨
    scene.dataset.scene = li.dataset.scene || "hello";
    scene.dataset.sprite = li.dataset.sprite || "";
    bg.style.backgroundImage = li.dataset.bg ? "url('" + li.dataset.bg + "')" : "";
    bg.style.imageRendering = li.dataset.smooth ? "auto" : "";
    label.textContent = li.dataset.label || "";
    sub.textContent = li.dataset.sub || "";
    board.textContent = li.dataset.board || "";

    // 말풍선 다시 튀어나오는 효과
    bubble.style.animation = "none";
    void bubble.offsetWidth;
    bubble.style.animation = "";

    text.innerHTML = li.innerHTML;
    if (!reduce) typewriter(text);
  }

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => {
    const total = visibleLines().length;
    if (index < total - 1) show(index + 1);
  });

  new MutationObserver(() => show(0)).observe(document.body, { attributes: true, attributeFilter: ["data-mode"] });
  show(0);
})();

// 프로젝트 카드: 자세히 보기를 누르면 아래에 상세가 펼쳐지고, 다른 카드를 누르면 기존 상세는 접힙니다
(function projectDetails() {
  const toggles = [...document.querySelectorAll(".detail-toggle")];
  if (!toggles.length) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setOpen(btn, open) {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "접기 ▲" : "자세히 보기 ▼";
    const card = btn.closest(".project-card");
    if (card) card.classList.toggle("is-open", open);
  }

  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const willOpen = btn.getAttribute("aria-expanded") !== "true";
      toggles.forEach((other) => setOpen(other, false));
      if (willOpen) {
        setOpen(btn, true);
        const panel = document.getElementById(btn.getAttribute("aria-controls"));
        panel.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
      }
    });
  });
})();

// 슬라이드: [data-slider] 안의 figure를 한 장씩 보여 주고 ◀ ▶ · 점 · 방향키 · 스와이프로 넘깁니다
(function sliders() {
  document.querySelectorAll("[data-slider]").forEach((root) => {
    const slides = [...root.querySelectorAll("figure")];
    if (slides.length < 2) return;
    let index = 0;
    // data-points: 현재 슬라이드 번호에 해당하는 행(data-slides="2,3" 또는 "4-11")만 보여 줍니다
    const pts = root.dataset.points ? document.querySelector(root.dataset.points) : null;
    const rows = pts ? [...pts.querySelectorAll("[data-slides]")] : [];
    const covers = (spec, n) => spec.split(",").some((p) => {
      const [a, b] = p.split("-").map(Number);
      return b ? n >= a && n <= b : n === a;
    });
    // 현재 화면에 해당하는 용어 칩만 보여 주고, 누른 칩의 설명을 아래에 펼칩니다
    const descBox = pts ? pts.querySelector(".chip-desc") : null;
    let picked = null;
    function pick(chip) {
      picked = chip;
      rows.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      if (!descBox) return;
      descBox.textContent = "";
      if (!chip) return;
      const term = document.createElement("strong");
      term.textContent = chip.textContent;
      descBox.append(term, chip.dataset.desc || "");
    }
    rows.forEach((c) => c.addEventListener("click", () => pick(c)));
    function updatePoints(n) {
      if (!pts) return;
      let visible = 0;
      rows.forEach((c) => {
        const on = covers(c.dataset.slides, n);
        c.hidden = !on;
        if (on) visible += 1;
      });
      pts.hidden = visible === 0;
      // 누른 칩이 이 화면에 없으면 보이는 첫 칩의 설명으로 바꿉니다
      if (!picked || picked.hidden) pick(rows.find((c) => !c.hidden) || null);
    }

    const controls = document.createElement("div");
    controls.className = "slider-controls";
    const prev = document.createElement("button");
    prev.type = "button"; prev.textContent = "◀"; prev.setAttribute("aria-label", "이전 화면");
    const next = document.createElement("button");
    next.type = "button"; next.textContent = "▶"; next.setAttribute("aria-label", "다음 화면");
    const dots = document.createElement("div");
    dots.className = "slider-dots";
    const dotEls = slides.map((_, i) => {
      const d = document.createElement("button");
      d.type = "button";
      d.setAttribute("aria-label", `${i + 1}번째 화면`);
      d.addEventListener("click", () => show(i));
      dots.appendChild(d);
      return d;
    });
    controls.append(prev, dots, next);
    root.appendChild(controls);
    root.tabIndex = 0;

    function show(i) {
      index = Math.max(0, Math.min(slides.length - 1, i));
      slides.forEach((s, n) => {
        s.hidden = n !== index;
        if (n !== index) s.querySelectorAll("video").forEach((v) => v.pause());
      });
      dotEls.forEach((d, n) => d.classList.toggle("on", n === index));
      prev.disabled = index === 0;
      next.disabled = index === slides.length - 1;
      updatePoints(index + 1);
    }

    prev.addEventListener("click", () => show(index - 1));
    next.addEventListener("click", () => show(index + 1));
    root.addEventListener("keydown", (e) => {
      if (e.target.tagName === "VIDEO") return; // 영상 위에서는 방향키가 되감기·빨리감기를 합니다
      if (e.key === "ArrowLeft") { show(index - 1); e.preventDefault(); }
      if (e.key === "ArrowRight") { show(index + 1); e.preventDefault(); }
    });

    let startX = null;
    root.addEventListener("touchstart", (e) => {
      // 영상 위에서 시작한 터치는 재생 막대 조작이므로 넘기기로 보지 않습니다
      startX = e.target.tagName === "VIDEO" ? null : e.touches[0].clientX;
    }, { passive: true });
    root.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
    });

    show(0);
  });
})();

// 탭: [data-tabs] 안의 버튼을 누르면 해당 패널만 보여 줍니다 (←/→ 방향키 지원)
(function tabs() {
  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const buttons = [...root.querySelectorAll("[role=tab]")];
    const panels = buttons.map((b) => document.getElementById(b.getAttribute("aria-controls")));
    function select(i, focus) {
      buttons.forEach((b, n) => {
        b.setAttribute("aria-selected", String(n === i));
        b.tabIndex = n === i ? 0 : -1;
        if (panels[n]) panels[n].hidden = n !== i;
      });
      if (focus) buttons[i].focus();
    }
    buttons.forEach((b, i) => {
      b.addEventListener("click", () => select(i, false));
      b.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") { select((i + 1) % buttons.length, true); e.preventDefault(); }
        if (e.key === "ArrowLeft") { select((i - 1 + buttons.length) % buttons.length, true); e.preventDefault(); }
      });
    });
    select(0, false);
  });
})();

// 목록 + 본문: 왼쪽 목록의 항목을 누르면 오른쪽에 그 본문만 보여 줍니다 (↑/↓ 방향키 지원)
(function splitView() {
  document.querySelectorAll("[data-split]").forEach((root) => {
    const items = [...root.querySelectorAll(".split-item")];
    const panes = items.map((b) => document.getElementById(b.dataset.pane));
    function select(i, focus) {
      items.forEach((b, n) => {
        b.setAttribute("aria-pressed", String(n === i));
        if (panes[n]) panes[n].hidden = n !== i;
      });
      if (focus) items[i].focus();
    }
    items.forEach((b, i) => {
      b.addEventListener("click", () => select(i, false));
      b.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") { select((i + 1) % items.length, true); e.preventDefault(); }
        if (e.key === "ArrowUp") { select((i - 1 + items.length) % items.length, true); e.preventDefault(); }
      });
    });
    select(0, false);
  });
})();
