/*
  Shared motion helpers.
  In-page anchor navigation runs through a single eased
  scroll system defined below, which also moves focus,
  so no second handler may drive the same jump.
*/

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);


/*
  Hero portrait — hide the broken-image icon
  if the path ever goes missing.
*/

const portrait =
  document.querySelector(".hero-person img");


if (portrait) {

  portrait.addEventListener(
    "error",
    function() {

      this.style.opacity = "0";

    }
  );

}


/*
  Image fade-in.
  Images that are still in flight fade in instead of
  popping; already-cached images are left untouched so
  nothing ever starts hidden without JS finishing.
*/

(function initImageFade() {

  if (prefersReducedMotion.matches) return;

  const images = document.querySelectorAll(
    ".project-image img, .built-image img"
  );

  const ease = "cubic-bezier(0.16, 1, 0.3, 1)";

  images.forEach(function (img) {

    if (img.complete && img.naturalWidth > 0) return;

    img.style.opacity = "0";

    const reveal = function () {
      img.style.transition = "opacity 420ms " + ease;
      img.style.opacity = "1";
    };

    img.addEventListener("load", reveal, { once: true });
    img.addEventListener("error", reveal, { once: true });

  });

})();


/*
  Project cards behave like one big link to their
  primary ("Live Demo") action. Cards whose action is
  still a placeholder are left alone.
*/

(function initCardLinks() {

  const cards = document.querySelectorAll(
    ".project-card, .built-card"
  );

  cards.forEach(function (card) {

    const link = card.querySelector(
      ".project-actions a, .built-actions a"
    );

    if (!link) return;

    const href = link.getAttribute("href") || "";

    if (!/^https?:\/\//i.test(href)) return;

    card.classList.add("is-clickable");

    card.addEventListener("click", function (event) {

      if (event.target.closest("a, button")) return;

      const selection = window.getSelection();

      if (selection && String(selection).length > 0) return;

      link.click();

    });

  });

})();


/*
  Fixed nav gains weight once the page moves.
  IntersectionObserver on a top sentinel, no scroll listeners.
*/

(function initNavState() {

  const nav = document.querySelector(".hero-nav");
  const sentinel = document.getElementById("topSentinel");

  if (!nav) return;
  if (!sentinel || !("IntersectionObserver" in window)) {
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      const entry = entries[0];
      nav.classList.toggle("is-scrolled", !entry.isIntersecting);
    },
    { root: null, threshold: 0 }
  );

  observer.observe(sentinel);

})();


/*
  Luxury chrome: preloader exit plus scroll progress
  driven by a single rAF loop on transform only.
*/

(function initLuxuryChrome() {

  document.body.classList.add("lux-loading");

  const preloader = document.getElementById("luxPreloader");
  const bar = document.getElementById("luxProgressBar");

  const hidePreloader = function () {
    document.body.classList.remove("lux-loading");
    if (preloader) preloader.classList.add("is-done");
  };

  if (document.readyState === "complete") {
    window.setTimeout(hidePreloader, 350);
  } else {
    window.addEventListener("load", function () {
      window.setTimeout(hidePreloader, 350);
    }, { once: true });
    window.setTimeout(hidePreloader, 2600);
  }

  if (!bar || prefersReducedMotion.matches) {
    if (bar) bar.style.transform = "scaleX(0)";
    return;
  }

  let queued = false;

  const update = function () {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    bar.style.transform = "scaleX(" + progress.toFixed(4) + ")";
  };

  const loop = function () {
    if (!queued) {
      queued = true;
      window.requestAnimationFrame(update);
    }
    window.setTimeout(loop, 120);
  };

  update();
  loop();

})();


/*
  Contact form
*/

const contactForm =
  document.getElementById("contactForm");

const formSuccess =
  document.getElementById("formSuccess");


const formRules = [
  {
    id: "name",
    test: function (value) {
      return value.length > 0;
    },
    message: "Please tell me your name.",
  },
  {
    id: "email",
    test: function (value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    },
    message: "That email address doesn't look right.",
  },
  {
    id: "subject",
    test: function (value) {
      return value.length > 0;
    },
    message: "Add a short subject.",
  },
  {
    id: "message",
    test: function (value) {
      return value.length > 0;
    },
    message: "Write a message before sending.",
  },
];


function setFieldError(input, message) {

  const group = input.closest(".form-group");
  const error = group ? group.querySelector(".field-error") : null;

  input.classList.add("is-invalid");
  input.setAttribute("aria-invalid", "true");

  if (error) {
    error.textContent = message;
    error.classList.add("is-shown");
  }

}


function clearFieldError(input) {

  if (!input.classList.contains("is-invalid")) return;

  const group = input.closest(".form-group");
  const error = group ? group.querySelector(".field-error") : null;

  input.classList.remove("is-invalid");
  input.removeAttribute("aria-invalid");

  if (error) {
    error.textContent = "";
    error.classList.remove("is-shown");
  }

}


if (contactForm) {

  formRules.forEach(function (rule) {

    const input = document.getElementById(rule.id);

    if (!input) return;

    input.addEventListener("input", function () {
      clearFieldError(input);
    });

  });


  contactForm.addEventListener("submit", function (event) {

    event.preventDefault();

    let firstInvalid = null;

    formRules.forEach(function (rule) {

      const input = document.getElementById(rule.id);

      if (!input) return;

      const value = input.value.trim();

      clearFieldError(input);

      if (!rule.test(value)) {

        setFieldError(input, rule.message);

        if (!firstInvalid) firstInvalid = input;

      }

    });

    if (firstInvalid) {

      firstInvalid.focus();

      return;

    }

    const name =
      document.getElementById("name").value.trim();

    const email =
      document.getElementById("email").value.trim();

    const subject =
      document.getElementById("subject").value.trim();

    const message =
      document.getElementById("message").value.trim();

    if (sendButton) sendButton.disabled = true;
    if (sendLabel) sendLabel.textContent = "Sending…";

    const releaseButton = function () {
      if (sendButton) sendButton.disabled = false;
    };

    if (!window.fetch) {
      flagSendError();
      releaseButton();
      return;
    }

    window.fetch("https://formspree.io/f/mzezajwp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        name: name,
        email: email,
        subject: subject,
        message: message
      })
    }).then(function (response) {
      if (!response.ok) throw new Error("send failed");
      formSuccess.classList.add("show");
      confirmSend();
    }).catch(function () {
      flagSendError();
    }).then(function () {
      releaseButton();
    });

  });

}


/*
  Send button — completion feedback, then reset.
*/

const sendButton =
  document.querySelector(".send-button");

const sendLabel =
  document.querySelector(".send-label");

let sendResetTimer = null;


function confirmSend() {

  if (!sendButton || !sendLabel) return;

  window.clearTimeout(sendResetTimer);

  sendButton.classList.add("is-sent");
  sendLabel.textContent = "Message sent";

  sendResetTimer = window.setTimeout(function () {

    sendButton.classList.remove("is-sent");
    sendLabel.textContent = "Send Message";

  }, 2600);

}


function flagSendError() {

  if (!sendButton || !sendLabel) return;

  window.clearTimeout(sendResetTimer);

  sendLabel.textContent = "Couldn't send. Try again.";

  sendResetTimer = window.setTimeout(function () {

    sendLabel.textContent = "Send Message";

  }, 2600);

}


/*
  Section reveals
*/

(function initReveals() {
  const nodes = document.querySelectorAll(".reveal");

  if (!nodes.length) return;

  const reduce = prefersReducedMotion.matches;

  if (reduce || !("IntersectionObserver" in window)) {
    nodes.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.12,
    }
  );

  nodes.forEach(function (el) {
    observer.observe(el);
  });
})();


/*
  Apple Design: Smooth Inertia Scroll Interpolation
*/

(function initAppleSmoothScroll() {
  if (prefersReducedMotion.matches) return;

  // Intercept in-page anchor navigation clicks for smooth Apple spring easing scroll
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      
      const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - 54;
      const startPosition = window.scrollY;
      const distance = targetPosition - startPosition;
      const duration = 1200; // ms, calm medium-slow pace
      let startTime = null;

      function easeInOutApple(t) {
        return t < 0.5
          ? 8 * t * t * t * t
          : 1 - Math.pow(-2 * t + 2, 4) / 2;
      }

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easedProgress = easeInOutApple(progress);

        window.scrollTo(0, startPosition + distance * easedProgress);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          targetEl.setAttribute("tabindex", "-1");
          targetEl.focus({ preventScroll: true });
        }
      }

      requestAnimationFrame(step);
    });
  });
})();

