/* ============================================================
   HEXON BETA — custom glass language dropdown
   ============================================================ */
"use strict";

const LANGS = [
  { code: "uk", label: "Українська" },
  { code: "en", label: "English"    },
  { code: "ru", label: "Русский"    },
  { code: "cs", label: "Čeština"    },
];

/* Tiny inline SVG flags. We store the literal SVG markup and
   convert it to a data URI at use-time so we never have to worry
   about quoting inside style attributes. */
const FLAG_SVGS = {
  uk: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23005bbb'/><rect y='1.5' width='4' height='1.5' fill='%23ffd500'/></svg>",
  en: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 30'><clipPath id='a'><rect width='60' height='30'/></clipPath><path d='M0,0 v30 h60 v-30 z' fill='%23012169'/><path d='M0,0 L60,30 M60,0 L0,30' stroke='%23fff' stroke-width='6'/><path d='M0,0 L60,30 M60,0 L0,30' clip-path='url(%23a)' stroke='%23C8102E' stroke-width='4'/><path d='M30,0 v30 M0,15 h60' stroke='%23fff' stroke-width='10'/><path d='M30,0 v30 M0,15 h60' stroke='%23C8102E' stroke-width='6'/></svg>",
  ru: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 2'><rect width='3' height='2' fill='%23fff'/><rect y='0.67' width='3' height='0.67' fill='%230039A6'/><rect y='1.33' width='3' height='0.67' fill='%23D52B1E'/></svg>",
  cs: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 4'><rect width='6' height='2' fill='%23fff'/><rect y='2' width='6' height='2' fill='%23D7141A'/><polygon points='0,0 3,2 0,4' fill='%2311457E'/></svg>",
};

function getFlagDataURI(code) {
  const svg = FLAG_SVGS[code] || FLAG_SVGS.en;
  return "data:image/svg+xml;utf8," + svg;
}

function getLang(code) {
  return LANGS.find(l => l.code === code) || LANGS[1];
}

const _dropdowns = [];

function makeFlagEl(code) {
  const flag = document.createElement("span");
  flag.className = "flag";
  flag.style.backgroundImage = "url(\"" + getFlagDataURI(code) + "\")";
  return flag;
}

function makeIconUse(id) {
  const NS = "http://www.w3.org/2000/svg";
  const XLINK = "http://www.w3.org/1999/xlink";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "ic-svg " + id);
  const use = document.createElementNS(NS, "use");
  use.setAttributeNS(XLINK, "href", "#i-" + id);
  use.setAttribute("href", "#i-" + id);
  svg.appendChild(use);
  return svg;
}

function buildLangDropdown(rootEl, opts) {
  const onChange = (opts && opts.onChange) || (() => {});
  let value = (opts && opts.value) || (state.settings && state.settings.lang) || "uk";

  rootEl.innerHTML = "";

  // Trigger
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "dropdown__trigger";

  const triggerFlag = makeFlagEl(value);
  const triggerLbl = document.createElement("span");
  triggerLbl.className = "lbl";
  triggerLbl.textContent = getLang(value).label;
  const caret = makeIconUse("caret");
  caret.classList.add("caret");

  trigger.appendChild(triggerFlag);
  trigger.appendChild(triggerLbl);
  trigger.appendChild(caret);
  rootEl.appendChild(trigger);

  // Menu
  const menu = document.createElement("div");
  menu.className = "dropdown__menu";
  menu.setAttribute("role", "listbox");

  const optionEls = LANGS.map(l => {
    const opt = document.createElement("button");
    opt.type = "button";
    opt.className = "dropdown__option" + (l.code === value ? " on" : "");
    opt.dataset.value = l.code;

    opt.appendChild(makeFlagEl(l.code));

    const lbl = document.createElement("span");
    lbl.textContent = l.label;
    opt.appendChild(lbl);

    const check = makeIconUse("check");
    check.classList.add("check");
    opt.appendChild(check);

    opt.addEventListener("click", e => {
      e.stopPropagation();
      setValue(l.code);
      close();
    });
    menu.appendChild(opt);
    return opt;
  });
  rootEl.appendChild(menu);

  function open() {
    closeAll();
    rootEl.classList.add("open");
  }
  function close() {
    rootEl.classList.remove("open");
  }
  function applyValueToDom(code) {
    triggerFlag.style.backgroundImage = "url(\"" + getFlagDataURI(code) + "\")";
    triggerLbl.textContent = getLang(code).label;
    optionEls.forEach(opt => {
      opt.classList.toggle("on", opt.dataset.value === code);
    });
  }
  function setValue(code) {
    if (code === value) return;
    value = code;
    applyValueToDom(code);
    onChange(code);
  }
  function setValueSilent(code) {
    if (!LANGS.some(l => l.code === code)) return;
    value = code;
    applyValueToDom(code);
  }

  trigger.addEventListener("click", e => {
    e.stopPropagation();
    if (rootEl.classList.contains("open")) close();
    else open();
  });

  const api = { setValue: setValueSilent, close, root: rootEl };
  _dropdowns.push(api);
  return api;
}

function closeAll() {
  _dropdowns.forEach(d => d.close());
}

document.addEventListener("click", () => closeAll());
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeAll();
});
