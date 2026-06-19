document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  const panels = Array.from(document.querySelectorAll(".filter-panel"));
  panels.forEach(function (panel) {
    const input = panel.querySelector("[data-card-search]");
    const scope = panel.closest("section") || document;
    const cards = Array.from(scope.querySelectorAll(".movie-card"));

    function applyFilter(value) {
      const query = value.trim().toLowerCase();
      cards.forEach(function (card) {
        const text = card.getAttribute("data-search") || "";
        card.classList.toggle("is-card-hidden", query.length > 0 && text.indexOf(query) === -1);
      });
    }

    if (input) {
      input.addEventListener("input", function () {
        applyFilter(input.value);
      });
    }

    panel.querySelectorAll("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        const value = button.getAttribute("data-filter") || "";
        if (input) {
          input.value = value;
        }
        applyFilter(value);
      });
    });
  });
});
