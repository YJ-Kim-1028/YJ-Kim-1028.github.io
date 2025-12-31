let isKo = false;
let currentSection = null;

const layout = document.getElementById("layout");
const infoPanel = document.getElementById("infoPanel");

const langBtn = document.getElementById("langBtn");
const workBtn = document.getElementById("workBtn");
const piBtn = document.getElementById("piBtn");
const licenseBtn = document.getElementById("licenseBtn");
const backBtn = document.getElementById("backBtn");

const sectionText = {
  en: {
    work: `<h2>Work Experience</h2>`,
    pi: `<h2>Personal Information</h2>`,
    license: `<h2>License & Study</h2>`,
  },
  ko: {
    work: `<h2>경력</h2>`,
    pi: `<h2>개인 정보</h2>`,
    license: `<h2>자격증 & 공부</h2>`,
  },
};

function setLabels() {
  if (isKo) {
    langBtn.textContent = "English";
    workBtn.textContent = "경력";
    piBtn.textContent = "개인 정보";
    licenseBtn.textContent = "자격증 & 공부";
    backBtn.textContent = "뒤로가기";
    document.documentElement.lang = "ko";
  } else {
    langBtn.textContent = "Korean";
    workBtn.textContent = "Work Experience";
    piBtn.textContent = "Personal Information";
    licenseBtn.textContent = "License & Study";
    backBtn.textContent = "Back";
    document.documentElement.lang = "en";
  }
}

function renderPanel() {
  if (!currentSection) return;
  const dict = isKo ? sectionText.ko : sectionText.en;
  infoPanel.innerHTML = dict[currentSection];
  infoPanel.classList.add("show");
}

function openSection(key) {
  currentSection = key;
  layout.classList.add("open");
  renderPanel();
}

function closeSection() {
  currentSection = null;
  layout.classList.remove("open");
  infoPanel.classList.remove("show");
  infoPanel.innerHTML = "";
}

workBtn.addEventListener("click", () => openSection("work"));
piBtn.addEventListener("click", () => openSection("pi"));
licenseBtn.addEventListener("click", () => openSection("license"));

langBtn.addEventListener("click", () => {
  isKo = !isKo;
  setLabels();
  renderPanel();
});

backBtn.addEventListener("click", closeSection);

// 초기 라벨 세팅
setLabels();
