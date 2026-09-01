(function () {
  const AUTO_PLAY_INTERVAL = 5000; // ms entre cada cambio automático

  const slides = document.querySelectorAll(".carousel__slide");
  const dots = document.querySelectorAll(".carousel__dot");
  const btnPrev = document.getElementById("prevSlide");
  const btnNext = document.getElementById("nextSlide");
  const carousel = document.getElementById("carousel");

  if (!slides.length) return; // no hay carrusel en esta página

  let currentIndex = 0;
  let autoPlayTimer = null;

  function goToSlide(index) {
    // Normaliza el índice para que dé la vuelta (circular)
    const total = slides.length;
    currentIndex = (index + total) % total;

    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === currentIndex);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === currentIndex);
    });
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = window.setInterval(nextSlide, AUTO_PLAY_INTERVAL);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      window.clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  // Controles manuales — cada clic reinicia el temporizador
  // para que no cambie justo después de que el usuario interactúa
  if (btnNext) {
    btnNext.addEventListener("click", function () {
      nextSlide();
      startAutoPlay();
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener("click", function () {
      prevSlide();
      startAutoPlay();
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      goToSlide(i);
      startAutoPlay();
    });
  });

  // Pausa el carrusel mientras el mouse está encima (mejor UX)
  if (carousel) {
    carousel.addEventListener("mouseenter", stopAutoPlay);
    carousel.addEventListener("mouseleave", startAutoPlay);
  }

  startAutoPlay();
})();
