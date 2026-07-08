const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress");
const revealItems = document.querySelectorAll(".reveal");
const hero = document.querySelector(".hero");
const contactSection = document.querySelector(".contact-section");
const standardsSection = document.querySelector("[data-standards-scroll]");
const productStage = document.querySelector("[data-product-stage]");
const productSlides = Array.from(document.querySelectorAll("[data-product-slide]"));
const productDots = Array.from(document.querySelectorAll("[data-product-dots] button"));
const curriculumRows = Array.from(document.querySelectorAll(".conveyor-row"));
const assessmentHero = document.querySelector("[data-assessment-hero]");
const assessmentFlow = document.querySelector("[data-assessment-flow]");
const assessmentFlowWrap = document.querySelector(".assessment-flow-wrap");
const assessmentDotsWrap = document.querySelector("[data-assessment-dots]");
const assessmentDots = Array.from(document.querySelectorAll("[data-assessment-dots] span"));
const newsSection = document.querySelector(".industry-news");
const newsRail = document.querySelector("[data-news-rail]");
const contactModal = document.querySelector("[data-contact-modal]");
const contactOpenButtons = Array.from(document.querySelectorAll("[data-contact-open]"));
const contactCloseButtons = Array.from(document.querySelectorAll("[data-contact-close]"));
const contactForm = document.querySelector("[data-contact-form]");
const contactStartedInput = document.querySelector("[data-contact-started]");
const contactStatus = document.querySelector("[data-contact-status]");
const contactSubmit = document.querySelector("[data-contact-submit]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const standardsOutputs = [
  {
    label: "Sample review grid",
    rows: [
      { title: "Grade 6 ELA Unit 2", code: "RI.6.2", status: "complete", text: "Aligned", icon: "ph-check-circle" },
      { title: "Grade 5 Math Practice", code: "5.NBT", status: "review", text: "Review", icon: "ph-clock" },
      { title: "Science performance task", code: "SC.8.P", status: "complete", text: "Aligned", icon: "ph-check-circle" },
    ],
  },
  {
    label: "State crosswalk",
    rows: [
      { title: "Texas reading benchmark", code: "TEKS 6.7", status: "complete", text: "Mapped", icon: "ph-check-circle" },
      { title: "NY algebra readiness", code: "A.REI.3", status: "draft", text: "Draft", icon: "ph-pencil-simple" },
      { title: "Lab investigation bank", code: "NGSS MS", status: "review", text: "Review", icon: "ph-clock" },
    ],
  },
  {
    label: "Publisher export",
    rows: [
      { title: "K-12 scope sequence", code: "ELA-LIT", status: "complete", text: "Aligned", icon: "ph-check-circle" },
      { title: "Multimedia activity set", code: "MATH-4", status: "complete", text: "Aligned", icon: "ph-check-circle" },
      { title: "Correlation appendix", code: "FINAL", status: "draft", text: "Queued", icon: "ph-arrow-circle-up" },
    ],
  },
];

const curriculumWordRows = [
  ["ELA", "Lessons", "Scope", "Reading", "Units", "Maps", "Writing", "Guides", "Levels", "Grammar", "Texts", "Flow"],
  ["Math", "Ancillaries", "Practice", "Algebra", "Rubrics", "Fluency", "Number", "Checks", "Games", "Geometry", "Banks", "Skills"],
  ["Science", "Handoff", "Review", "Labs", "Media", "Drafts", "Inquiry", "Edits", "Forms", "Earth", "Proof", "Final"],
];

const assessmentStates = [
  {
    kicker: "Assessment blueprint",
    title: "Interim Reading",
    value: 96,
  },
  {
    kicker: "Calibration pass",
    title: "Rubric Review",
    value: 91,
  },
  {
    kicker: "District package",
    title: "Final Delivery",
    value: 99,
  },
  {
    kicker: "Item bank",
    title: "Math Benchmark",
    value: 94,
  },
];

const getWrappedIndex = (index, length) => ((index % length) + length) % length;

const setCurriculumRowWords = (row, words) => {
  const visibleWords = [...words, ...words];
  const nodes = Array.from(row.querySelectorAll("[data-curriculum-word]"));

  while (nodes.length < visibleWords.length) {
    const node = document.createElement("span");
    node.className = "conveyor-word";
    node.dataset.curriculumWord = "";
    row.appendChild(node);
    nodes.push(node);
  }

  while (nodes.length > visibleWords.length) {
    nodes.pop().remove();
  }

  nodes.forEach((node, index) => {
    node.textContent = visibleWords[index] || "";
  });
};

const recycleCurriculumRow = (row, words, reverse = false) => {
  const recycledWord = row.firstElementChild;

  if (!recycledWord) return;

  const nextWordIndex = Number(row.dataset.curriculumNextWord || 0);

  row.appendChild(recycledWord);
  recycledWord.textContent = words[getWrappedIndex(nextWordIndex, words.length)];
  row.dataset.curriculumNextWord = String(nextWordIndex + (reverse ? -1 : 1));
};

const startCurriculumConveyor = () => {
  if (!curriculumRows.length) return;

  curriculumRows.forEach((row, index) => {
    const words = curriculumWordRows[index] || curriculumWordRows[0];
    const reverse = index % 2 === 1;
    row.classList.toggle("is-reversing", reverse);
    setCurriculumRowWords(row, words);
  });
};

const animateAssessmentValue = (node, fromValue, toValue) => {
  if (!node) return;

  node.assessmentAnimationId = (node.assessmentAnimationId || 0) + 1;
  const animationId = node.assessmentAnimationId;

  if (reducedMotion.matches) {
    node.textContent = String(toValue);
    return;
  }

  const startedAt = performance.now();
  const duration = 950;

  const tick = (time) => {
    if (node.assessmentAnimationId !== animationId) return;

    const progress = clamp((time - startedAt) / duration);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const nextValue = Math.round(fromValue + (toValue - fromValue) * easedProgress);

    node.textContent = String(nextValue);

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    }
  };

  window.requestAnimationFrame(tick);
};

const startAssessmentAnimation = () => {
  if (!assessmentHero || !assessmentFlow) return;

  const kicker = assessmentHero.querySelector("[data-assessment-kicker]");
  const title = assessmentHero.querySelector("[data-assessment-title]");
  const value = assessmentHero.querySelector("[data-assessment-value]");
  const sourceCards = Array.from(assessmentFlow.querySelectorAll(".assessment-card"));
  const firstCardClone = sourceCards[0]?.cloneNode(true);
  let activeIndex = 0;
  let assessmentTimer = null;
  let resetTimer = null;
  let isAssessmentPaused = false;

  if (firstCardClone && !assessmentFlow.querySelector("[data-assessment-clone]")) {
    firstCardClone.dataset.assessmentClone = "";
    firstCardClone.setAttribute("aria-hidden", "true");
    assessmentFlow.appendChild(firstCardClone);
  }

  const setAssessmentState = (index) => {
    const state = assessmentStates[index];
    const cards = Array.from(assessmentFlow.querySelectorAll(".assessment-card"));

    if (kicker) kicker.textContent = state.kicker;
    if (title) title.textContent = state.title;
    if (value) value.textContent = "0";
    assessmentHero.classList.add("is-resetting-progress");
    assessmentHero.style.setProperty("--assessment-fill", "0%");
    void assessmentHero.offsetHeight;
    assessmentHero.classList.remove("is-resetting-progress");
    window.requestAnimationFrame(() => {
      animateAssessmentValue(value, 0, state.value);
      assessmentHero.style.setProperty("--assessment-fill", `${state.value}%`);
    });
    assessmentHero.classList.remove("is-switching");
    void assessmentHero.offsetHeight;
    assessmentHero.classList.add("is-switching");

    const cardIndex = index % Math.max(1, sourceCards.length);
    const cardWidth = cards[0]?.getBoundingClientRect().width || 0;
    const flowGap = Number.parseFloat(getComputedStyle(assessmentFlow).columnGap || "0");
    const offset = cardIndex * (cardWidth + flowGap);

    assessmentDots.forEach((dot, currentIndex) => {
      const isVisibleStep = currentIndex === cardIndex || currentIndex === (cardIndex + 1) % sourceCards.length;
      dot.classList.toggle("is-active", isVisibleStep);
    });
    assessmentFlow.style.transform = `translate3d(-${offset}px, 0, 0)`;

    if (resetTimer) window.clearTimeout(resetTimer);

    if (cardIndex === sourceCards.length - 1 && !reducedMotion.matches) {
      resetTimer = window.setTimeout(() => {
        assessmentFlow.classList.add("is-resetting");
        assessmentFlow.style.transform = "translate3d(0, 0, 0)";
        void assessmentFlow.offsetHeight;
        assessmentFlow.classList.remove("is-resetting");
      }, 2260);
    }
  };

  setAssessmentState(0);

  if (reducedMotion.matches) return;

  const queueNextAssessmentStep = () => {
    assessmentTimer = window.setTimeout(() => {
      assessmentTimer = null;
      if (isAssessmentPaused || assessmentFlowWrap?.matches(":hover") || assessmentDotsWrap?.matches(":hover")) {
        queueNextAssessmentStep();
        return;
      }

      activeIndex = (activeIndex + 1) % assessmentStates.length;
      setAssessmentState(activeIndex);
      queueNextAssessmentStep();
    }, 2400);
  };

  const pauseAssessmentAnimation = () => {
    isAssessmentPaused = true;
    if (assessmentTimer) window.clearTimeout(assessmentTimer);
    if (resetTimer) window.clearTimeout(resetTimer);
    assessmentTimer = null;
    resetTimer = null;
  };

  const resumeAssessmentAnimation = () => {
    isAssessmentPaused = false;
    if (assessmentTimer) return;
    queueNextAssessmentStep();
  };

  const updateAssessmentPauseFromPointer = (event) => {
    const hoverTargets = [assessmentFlowWrap, assessmentDotsWrap].filter(Boolean);
    const isInsideSlider = hoverTargets.some((node) => {
      const rect = node.getBoundingClientRect();
      return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    });

    if (isInsideSlider) {
      pauseAssessmentAnimation();
    } else if (isAssessmentPaused) {
      resumeAssessmentAnimation();
    }
  };

  [assessmentFlowWrap, assessmentDotsWrap].filter(Boolean).forEach((node) => {
    node.addEventListener("pointerenter", pauseAssessmentAnimation);
    node.addEventListener("pointerleave", resumeAssessmentAnimation);
    node.addEventListener("mouseenter", pauseAssessmentAnimation);
    node.addEventListener("mouseleave", resumeAssessmentAnimation);
  });
  document.addEventListener("mousemove", updateAssessmentPauseFromPointer, { passive: true });

  queueNextAssessmentStep();
};

const standardsOrbit = standardsSection
  ? {
      map: standardsSection.querySelector(".standards-map"),
      ledger: standardsSection.querySelector("[data-standards-ledger]"),
      label: standardsSection.querySelector("[data-ledger-label]"),
      rows: Array.from(standardsSection.querySelectorAll("[data-ledger-row]")),
      nodes: [
        { className: "node-b", angle: 224, radius: 0.96, speed: 0.94 },
        { className: "node-c", angle: 156, radius: 1.03, speed: 1.05 },
        { className: "node-d", angle: 88, radius: 0.82, speed: 0.82 },
        { className: "node-e", angle: 316, radius: 0.96, speed: 1.02 },
        { className: "node-f", angle: 34, radius: 0.88, speed: 0.9 },
      ],
      activeOutput: -1,
      swapTimers: [],
    }
  : null;

const setScrollState = () => {
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progressWidth = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  const contactRect = contactSection?.getBoundingClientRect();
  const headerHeight = header?.offsetHeight || 0;
  const isUnderContact =
    Boolean(contactRect) &&
    contactRect.top <= headerHeight * 0.35 &&
    contactRect.bottom > headerHeight;
  const isPastContactStart =
    Boolean(contactSection) &&
    scrollTop >=
      Math.min(
        contactSection.offsetTop - headerHeight * 0.45,
        Math.max(0, scrollHeight - contactSection.offsetHeight - headerHeight),
      );

  header.classList.toggle("is-scrolled", scrollTop > 18);
  header.classList.toggle("is-under-contact", isUnderContact || isPastContactStart);
  progress.style.width = `${progressWidth}%`;
};

const revealVisibleItems = () => {
  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.04;

    if (isVisible) {
      item.classList.add("is-visible");
    }
  });
};

const setLedgerOutput = (index, immediate = false) => {
  if (!standardsOrbit?.ledger || standardsOrbit.activeOutput === index) return;

  const output = standardsOutputs[index];
  const applyOutput = () => {
    standardsOrbit.label.textContent = output.label;

    standardsOrbit.rows.forEach((row, rowIndex) => {
      const data = output.rows[rowIndex];
      const title = row.querySelector("[data-ledger-title]");
      const code = row.querySelector("[data-ledger-code]");
      const status = row.querySelector("[data-ledger-status]");

      title.textContent = data.title;
      code.textContent = data.code;
      status.className = data.status;
      status.innerHTML = `<i class="ph ${data.icon}" aria-hidden="true"></i> ${data.text}`;
    });
  };

  standardsOrbit.activeOutput = index;
  standardsOrbit.swapTimers.forEach((timer) => window.clearTimeout(timer));
  standardsOrbit.swapTimers = [];
  standardsOrbit.rows.forEach((row) => row.classList.remove("is-card-active"));

  if (immediate || reducedMotion.matches) {
    standardsOrbit.ledger.classList.remove("is-swapping");
    applyOutput();
    return;
  }

  standardsOrbit.ledger.classList.add("is-swapping");
  standardsOrbit.swapTimers.push(window.setTimeout(applyOutput, 120));
  standardsOrbit.swapTimers.push(
    window.setTimeout(() => standardsOrbit.ledger.classList.remove("is-swapping"), 260),
  );
};

const startProductSlider = () => {
  if (!productStage || !productSlides.length) return;

  let activeIndex = Math.max(0, productSlides.findIndex((slide) => slide.classList.contains("is-active")));
  let sliderTimer = null;
  let isPaused = false;

  const stopSlider = () => {
    if (!sliderTimer) return;
    window.clearInterval(sliderTimer);
    sliderTimer = null;
  };

  const isProductHovered = () =>
    productStage.matches(":hover") ||
    productSlides.some((slide) => slide.matches(":hover")) ||
    productDots.some((dot) => dot.matches(":hover"));

  const startSlider = () => {
    if (reducedMotion.matches || isPaused || sliderTimer) return;
    sliderTimer = window.setInterval(() => {
      if (isPaused || isProductHovered()) return;
      setProductSlide(activeIndex + 1);
    }, 3200);
  };

  const setProductSlide = (nextIndex) => {
    const normalizedIndex = getWrappedIndex(nextIndex, productSlides.length);
    if (normalizedIndex === activeIndex) return;

    const currentSlide = productSlides[activeIndex];
    const nextSlide = productSlides[normalizedIndex];

    currentSlide.classList.remove("is-active");
    currentSlide.classList.add("is-exiting");
    nextSlide.classList.remove("is-exiting");
    nextSlide.classList.add("is-active");

    productDots.forEach((dot, index) => {
      const isActive = index === normalizedIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });

    window.setTimeout(() => currentSlide.classList.remove("is-exiting"), 640);
    activeIndex = normalizedIndex;
  };

  productSlides.forEach((slide, index) => {
    slide.classList.toggle("is-active", index === activeIndex);
    slide.classList.remove("is-exiting");
  });

  productDots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeIndex);
    dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    dot.addEventListener("click", () => {
      setProductSlide(index);
      stopSlider();
      startSlider();
    });
  });

  const pauseProductSlider = () => {
    isPaused = true;
    stopSlider();
  };

  const resumeProductSlider = () => {
    isPaused = false;
    startSlider();
  };

  [productStage, ...productSlides, ...productDots].filter(Boolean).forEach((node) => {
    node.addEventListener("pointerenter", pauseProductSlider);
    node.addEventListener("pointerleave", resumeProductSlider);
    node.addEventListener("mouseenter", pauseProductSlider);
    node.addEventListener("mouseleave", resumeProductSlider);
  });

  document.addEventListener(
    "mousemove",
    (event) => {
      const rect = productStage.getBoundingClientRect();
      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (isInside) {
        pauseProductSlider();
      } else if (isPaused) {
        resumeProductSlider();
      }
    },
    { passive: true },
  );

  document.addEventListener("click", (event) => {
    if (!productStage.contains(event.target)) {
      isPaused = false;
      startSlider();
    }
  });

  productStage.addEventListener("focusin", () => {
    isPaused = true;
    stopSlider();
  });

  productStage.addEventListener("focusout", () => {
    isPaused = false;
    startSlider();
  });

  startSlider();
};

const updateLedgerCardProgress = (progress, outputIndex) => {
  if (!standardsOrbit?.rows.length) return;

  if (reducedMotion.matches) {
    standardsOrbit.rows.forEach((row, index) => row.classList.toggle("is-card-active", index === 0));
    return;
  }

  const segmentStart = outputIndex === 0 ? 0 : outputIndex === 1 ? 0.34 : 0.68;
  const segmentEnd = outputIndex === 0 ? 0.34 : outputIndex === 1 ? 0.68 : 1;
  const segmentProgress = clamp((progress - segmentStart) / Math.max(0.001, segmentEnd - segmentStart));
  const activeCard = Math.min(2, Math.floor(segmentProgress * 3));

  standardsOrbit.rows.forEach((row, index) => {
    row.classList.toggle("is-card-active", index === activeCard);
  });
};

const positionNode = (node, x, y, progress, angle) => {
  const width = node.offsetWidth;
  const height = node.offsetHeight;
  const depth = clamp(y / (standardsOrbit.map.offsetHeight || 1), 0, 1);
  const scale = 0.92 + depth * 0.13 + progress * 0.03;

  node.style.left = `${x - width / 2}px`;
  node.style.top = `${y - height / 2}px`;
  node.style.setProperty("--node-scale", scale.toFixed(3));
  node.style.setProperty("--node-tilt", `${Math.sin(angle) * 7}deg`);
};

const updateStandardsEffect = () => {
  if (!standardsSection || !standardsOrbit?.map) return;

  const sectionRect = standardsSection.getBoundingClientRect();
  const rawProgress = (window.innerHeight - sectionRect.top) / (sectionRect.height + window.innerHeight);
  const progress = clamp((rawProgress - 0.08) / 0.84);
  const motionProgress = reducedMotion.matches ? 0 : progress;
  const map = standardsOrbit.map;
  const mapWidth = map.clientWidth;
  const mapHeight = map.clientHeight;

  if (!mapWidth || !mapHeight) return;

  standardsSection.style.setProperty("--standards-progress", progress.toFixed(4));
  standardsSection.style.setProperty("--standards-turn", `${motionProgress * 320}deg`);
  standardsSection.style.setProperty("--standards-turn-reverse", `${motionProgress * -240}deg`);
  standardsSection.style.setProperty("--line-dash", `${motionProgress * -150}`);
  standardsSection.style.setProperty("--line-opacity", (0.26 + progress * 0.42).toFixed(3));
  standardsSection.style.setProperty("--line-alt-opacity", (0.18 + progress * 0.34).toFixed(3));
  standardsSection.style.setProperty("--visual-orbit-opacity", (0.16 + progress * 0.34).toFixed(3));
  standardsSection.style.setProperty("--visual-orbit-scale", (0.9 + progress * 0.18).toFixed(3));
  standardsSection.style.setProperty("--orbit-opacity", (0.44 + progress * 0.28).toFixed(3));
  standardsSection.style.setProperty("--orbit-inner-opacity", (0.2 + progress * 0.24).toFixed(3));
  standardsSection.style.setProperty("--orbit-core-opacity", (0.14 + progress * 0.2).toFixed(3));
  standardsSection.style.setProperty("--central-ring-opacity", (0.04 + progress * 0.08).toFixed(3));
  standardsSection.style.setProperty("--ledger-opacity", (0.48 + clamp(progress * 1.55) * 0.52).toFixed(3));
  standardsSection.style.setProperty("--ledger-y", `${(1 - clamp(progress * 1.35)) * 18}px`);

  const centerX = mapWidth / 2;
  const centerY = mapHeight * (mapWidth < 520 ? 0.48 : 0.46);
  const radiusX = mapWidth * (mapWidth < 480 ? 0.38 : 0.43);
  const radiusY = mapHeight * (mapWidth < 480 ? 0.33 : 0.36);
  const centerNode = map.querySelector(".node-a");

  if (centerNode) {
    positionNode(centerNode, centerX, centerY, progress, 0);
  }

  standardsOrbit.nodes.forEach((config) => {
    const node = map.querySelector(`.${config.className}`);
    const line = map.querySelector(`[data-line-for="${config.className}"]`);
    const angle = ((config.angle + motionProgress * 255 * config.speed) * Math.PI) / 180;
    const drift = Math.sin(motionProgress * Math.PI * 2 + config.angle) * 8;
    const x = centerX + Math.cos(angle) * radiusX * config.radius;
    const y = centerY + Math.sin(angle) * radiusY * config.radius + drift;

    if (node) {
      positionNode(node, x, y, progress, angle);
    }

    if (line) {
      line.setAttribute("x1", centerX);
      line.setAttribute("y1", centerY);
      line.setAttribute("x2", x);
      line.setAttribute("y2", y);
    }
  });

  const outputIndex = progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2;
  setLedgerOutput(outputIndex);
  updateLedgerCardProgress(progress, outputIndex);
};

const setNewsRailLoop = (isEnabled) => {
  if (!newsRail) return 0;

  const clones = Array.from(newsRail.querySelectorAll("[data-news-clone]"));

  if (!isEnabled) {
    clones.forEach((clone) => clone.remove());
    return 0;
  }

  const originalCards = Array.from(newsRail.querySelectorAll("article:not([data-news-clone])"));

  if (!clones.length) {
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.dataset.newsClone = "";
      clone.setAttribute("aria-hidden", "true");
      clone.querySelectorAll("a").forEach((link) => {
        link.tabIndex = -1;
      });
      newsRail.appendChild(clone);
    });
  }

  const firstCard = originalCards[0];
  const firstClone = newsRail.querySelector("[data-news-clone]");

  return firstCard && firstClone ? Math.max(1, firstClone.offsetTop - firstCard.offsetTop) : 0;
};

const updateNewsRailEffect = () => {
  if (!newsSection || !newsRail) return;

  const shouldAnimate = !reducedMotion.matches && !window.matchMedia("(max-width: 1060px)").matches;
  const cycleDistance = setNewsRailLoop(shouldAnimate);

  if (!shouldAnimate || !cycleDistance) {
    newsRail.style.setProperty("--news-rail-y", "0px");
    return;
  }

  const rect = newsSection.getBoundingClientRect();
  const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const startY = Math.min(Math.max(0, newsSection.offsetTop - window.innerHeight), maxScrollY);
  const visibleHeight = newsRail.parentElement?.clientHeight || window.innerHeight;
  const leadIn = Math.min(120, visibleHeight * 0.18);
  const scrolled = Math.max(0, window.scrollY - startY);
  const y = leadIn - ((scrolled / 2.8) % cycleDistance);

  newsRail.style.setProperty("--news-rail-y", `${y.toFixed(1)}px`);
};

const scrollToHash = (hash, behavior = "smooth") => {
  if (!hash || hash === "#") return;

  const id = decodeURIComponent(hash.slice(1));
  const target = document.getElementById(id);

  if (!target) return;

  const headerOffset = header?.offsetHeight || 0;
  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);

  window.scrollTo({ top, behavior });
  window.setTimeout(revealVisibleItems, behavior === "smooth" ? 360 : 80);
};

const setContactStatus = (message = "", state = "") => {
  if (!contactStatus) return;

  contactStatus.textContent = message;
  contactStatus.classList.toggle("is-error", state === "error");
  contactStatus.classList.toggle("is-success", state === "success");
};

const setContactStartedAt = () => {
  if (!contactStartedInput) return;

  contactStartedInput.value = String(Math.floor(Date.now() / 1000));
};

const openContactModal = () => {
  if (!contactModal) return;

  contactModal.hidden = false;
  document.body.classList.add("is-contact-modal-open");
  setContactStartedAt();
  setContactStatus("");
  window.setTimeout(() => contactForm?.querySelector("input, select, textarea")?.focus(), 40);
};

const closeContactModal = () => {
  if (!contactModal) return;

  contactModal.hidden = true;
  document.body.classList.remove("is-contact-modal-open");
};

contactOpenButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    openContactModal();
  });
});

contactCloseButtons.forEach((button) => {
  button.addEventListener("click", closeContactModal);
});

contactModal?.addEventListener("click", (event) => {
  if (event.target === contactModal) {
    closeContactModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && contactModal && !contactModal.hidden) {
    closeContactModal();
  }
});

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  contactForm.classList.add("is-sending");
  contactSubmit?.setAttribute("disabled", "disabled");
  setContactStatus("Sending your message...");

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { Accept: "application/json" },
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.ok === false) {
      throw new Error(result.message || "The message could not be sent. Please try again.");
    }

    contactForm.reset();
    setContactStartedAt();
    setContactStatus(result.message || "Thanks. Your message has been sent.", "success");
  } catch (error) {
    setContactStatus(error.message || "The message could not be sent. Please try again.", "error");
  } finally {
    contactForm.classList.remove("is-sending");
    contactSubmit?.removeAttribute("disabled");
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -4% 0px" },
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 3, 2) * 90}ms`;
  revealObserver.observe(item);
});

if (hero) {
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
    hero.style.setProperty("--hero-x", `${x}px`);
    hero.style.setProperty("--hero-y", `${y}px`);
  });

  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--hero-x", "0px");
    hero.style.setProperty("--hero-y", "0px");
  });
}

let scrollFrame = null;

const updateScrollEffects = () => {
  setScrollState();
  updateStandardsEffect();
  updateNewsRailEffect();
};

const requestScrollEffects = () => {
  if (scrollFrame !== null) return;

  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = null;
    updateScrollEffects();
  });
};

window.addEventListener("scroll", requestScrollEffects, { passive: true });
window.addEventListener("resize", updateScrollEffects);
window.addEventListener("load", updateScrollEffects);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.defaultPrevented) return;

    const hash = link.getAttribute("href");

    if (!hash || hash === "#") return;

    const target = document.getElementById(hash.slice(1));

    if (!target) return;

    event.preventDefault();
    history.pushState(null, "", hash);
    scrollToHash(hash);
  });
});

window.addEventListener("hashchange", () => scrollToHash(window.location.hash));

setLedgerOutput(0, true);
updateScrollEffects();
startCurriculumConveyor();
startAssessmentAnimation();
startProductSlider();
requestAnimationFrame(revealVisibleItems);

if (window.location.hash) {
  window.setTimeout(() => scrollToHash(window.location.hash, "auto"), 90);
  window.setTimeout(() => scrollToHash(window.location.hash, "auto"), 450);
  window.setTimeout(() => scrollToHash(window.location.hash, "auto"), 1000);
}
