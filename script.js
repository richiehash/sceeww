const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress");
const revealItems = document.querySelectorAll(".reveal");
const hero = document.querySelector(".hero");

const setScrollState = () => {
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progressWidth = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

  header.classList.toggle("is-scrolled", scrollTop > 18);
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

window.addEventListener("scroll", setScrollState, { passive: true });
window.addEventListener("resize", setScrollState);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
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

setScrollState();
requestAnimationFrame(revealVisibleItems);

if (window.location.hash) {
  window.setTimeout(() => scrollToHash(window.location.hash, "auto"), 90);
  window.setTimeout(() => scrollToHash(window.location.hash, "auto"), 450);
  window.setTimeout(() => scrollToHash(window.location.hash, "auto"), 1000);
}
