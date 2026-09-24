/*
  About button
*/

const aboutButton =
  document.querySelector(".hero-about-btn");


if (aboutButton) {

  aboutButton.addEventListener(
    "click",
    function(event) {

      const aboutSection =
        document.querySelector("#about");

      if (aboutSection) {

        event.preventDefault();

        aboutSection.scrollIntoView({
          behavior: scrollBehavior()
        });

      }

    }

  );

}


/*
  Image fallback
  If image path is wrong,
  hide broken-image icon.
*/

const portrait =
  document.querySelector(".portrait");


if (portrait) {

  portrait.addEventListener(
    "error",
    function() {

      this.style.opacity = "0";

    }
  );

}


/*
  Smooth scroll for View All Projects
*/

document
  .querySelector(".view-all")
  ?.addEventListener("click", function (event) {

    const target =
      document.querySelector("#all-projects");

    if (target) {

      event.preventDefault();

      target.scrollIntoView({
        behavior: scrollBehavior()
      });

    }

  });


/*
  Contact form
*/

const contactForm =
  document.getElementById("contactForm");

const formSuccess =
  document.getElementById("formSuccess");


if (contactForm) {

  contactForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name =
      document.getElementById("name").value.trim();

    const email =
      document.getElementById("email").value.trim();

    const subject =
      document.getElementById("subject").value.trim();

    const message =
      document.getElementById("message").value.trim();

    if (!name || !email || !subject || !message) {
      return;
    }

    const receiver =
      "Mr.HarshithQ7@gmail.com";

    const mailSubject =
      encodeURIComponent(subject);

    const mailBody =
      encodeURIComponent(
        `Name: ${name}\n` +
        `Email: ${email}\n\n` +
        `${message}`
      );

    window.location.href =
      `mailto:${receiver}?subject=${mailSubject}&body=${mailBody}`;

    formSuccess.classList.add("show");

  });

}


/*
  Motion helpers + section reveals
*/

function scrollBehavior() {
  return window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches
    ? "auto"
    : "smooth";
}


(function initReveals() {
  const nodes = document.querySelectorAll(".reveal");

  if (!nodes.length) return;

  const reduce = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

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
