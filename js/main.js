/**
 * YOLANDA GUNTER MINISTRIES
 * June 2026 Prayer Focus — Main JavaScript
 * main.js | Version 1.0
 * Last updated: June 2026
 *
 * Responsibilities:
 *  - Accessible image carousel (keyboard, screen reader, reduced motion)
 *  - Mobile navigation toggle
 *  - Slide counter update
 */

(function () {
  'use strict';

  /* ============================================================
     CAROUSEL
  ============================================================ */
  const track       = document.getElementById('carousel-track');
  const slides      = Array.from(track.querySelectorAll('.carousel-slide'));
  const dots        = Array.from(document.querySelectorAll('.carousel-dot'));
  const prevBtn     = document.getElementById('carousel-prev');
  const nextBtn     = document.getElementById('carousel-next');
  const pauseBtn    = document.getElementById('carousel-pause');
  const liveRegion  = document.getElementById('carousel-live');
  const pauseIcon   = document.getElementById('pause-icon');
  const playIcon    = document.getElementById('play-icon');
  const counter     = document.getElementById('slide-counter');

  let current  = 0;
  let autoPlay = true;
  let timer    = null;
  const INTERVAL = 5500; // ms between auto-advance

  /**
   * Navigate to a specific slide index.
   * Handles wrapping, aria-hidden, dot state, live region, and counter.
   * @param {number} index
   */
  function goTo(index) {
    index = (index + slides.length) % slides.length;

    // Update aria-hidden on all slides
    slides.forEach(function (s, i) {
      s.setAttribute('aria-hidden', i !== index ? 'true' : 'false');
    });

    // Move track
    track.style.transform = 'translateX(-' + (index * 100) + '%)';

    // Update dot states
    dots.forEach(function (d, i) {
      const active = i === index;
      d.classList.toggle('active', active);
      d.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    // Announce slide to screen readers
    const slideLabel = slides[index].getAttribute('aria-label') || ('Slide ' + (index + 1));
    liveRegion.textContent = slideLabel;

    // Update slide counter in hero right panel
    if (counter) {
      const n = String(index + 1).padStart(2, '0');
      const t = String(slides.length).padStart(2, '0');
      counter.innerHTML = '<strong>' + n + '</strong> / ' + t;
    }

    current = index;
  }

  /* ---- Auto-play ---- */
  function startAuto() {
    clearInterval(timer);
    if (autoPlay) {
      timer = setInterval(function () { goTo(current + 1); }, INTERVAL);
    }
  }

  function stopAuto() {
    clearInterval(timer);
  }

  /* ---- Arrow controls ---- */
  prevBtn.addEventListener('click', function () {
    goTo(current - 1);
    stopAuto();
    startAuto();
  });

  nextBtn.addEventListener('click', function () {
    goTo(current + 1);
    stopAuto();
    startAuto();
  });

  /* ---- Dot controls ---- */
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goTo(parseInt(dot.dataset.index, 10));
      stopAuto();
      startAuto();
    });
  });

  /* ---- Pause / play toggle ---- */
  pauseBtn.addEventListener('click', function () {
    autoPlay = !autoPlay;
    pauseBtn.setAttribute('aria-pressed', autoPlay ? 'false' : 'true');
    pauseBtn.setAttribute('aria-label', autoPlay ? 'Pause carousel auto-play' : 'Resume carousel auto-play');
    pauseIcon.style.display = autoPlay ? '' : 'none';
    playIcon.style.display  = autoPlay ? 'none' : '';
    if (autoPlay) { startAuto(); } else { stopAuto(); }
  });

  /* ---- Keyboard navigation (WCAG 2.1.1) ---- */
  document.querySelector('.carousel').addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); stopAuto(); startAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); stopAuto(); startAuto(); }
  });

  /* ---- Pause on hover / focus (WCAG 2.2.2) ---- */
  const carousel = document.querySelector('.carousel');
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);
  carousel.addEventListener('focusin',    stopAuto);
  carousel.addEventListener('focusout',   startAuto);

  /* ---- Respect prefers-reduced-motion ---- */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    autoPlay = false;
    pauseIcon.style.display = 'none';
    playIcon.style.display  = '';
    pauseBtn.setAttribute('aria-pressed', 'true');
    pauseBtn.setAttribute('aria-label', 'Resume carousel auto-play');
  }

  /* ============================================================
     MOBILE NAVIGATION TOGGLE
  ============================================================ */
  const toggle  = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-list');

  toggle.addEventListener('click', function () {
    const open = navList.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  });

  // Close mobile nav when any link is clicked
  navList.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navList.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============================================================
     INIT
  ============================================================ */
  goTo(0);
  startAuto();

  /* ============================================================
     SIGNUP FORM — SUPABASE INTEGRATION
     Source: 5am-fire | Project: yemgunter-capture
  ============================================================ */
  const SUPABASE_URL     = 'https://mmzpxjdleikbpyijqxxh.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tenB4amRsZWlrYnB5aWpxeHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExOTM2NzksImV4cCI6MjA5Njc2OTY3OX0.e1blN1lMCJu01dYN1GfxiT6ZQZ2vdLvRUZDjk3d74TA';
  const SOURCE           = '5am-fire';

  var signupForm   = document.querySelector('.signup-form');
  var formMessage  = document.getElementById('form-message');

  if (signupForm && formMessage) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name      = document.getElementById('signup-name').value.trim();
      var email     = document.getElementById('signup-email').value.trim();
      var submitBtn = signupForm.querySelector('button[type="submit"]');

      // Client-side validation
      if (!name || !email) {
        formMessage.textContent     = 'Please enter your name and email address.';
        formMessage.style.color     = '#c0392b';
        formMessage.style.display   = 'block';
        return;
      }

      // Lock button during request
      submitBtn.disabled    = true;
      submitBtn.textContent = 'Sending…';

      fetch(SUPABASE_URL + '/rest/v1/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type'  : 'application/json',
          'apikey'        : SUPABASE_ANON_KEY,
          'Authorization' : 'Bearer ' + SUPABASE_ANON_KEY,
          'Prefer'        : 'return=minimal'
        },
        body: JSON.stringify({
          first_name : name,
          email      : email,
          source     : SOURCE
        })
      })
      .then(function (response) {
        if (response.ok) {
          formMessage.textContent   = '✅ You\'re registered! Check your inbox for the Prayer Focus guide.';
          formMessage.style.color   = '#27ae60';
          signupForm.reset();
          return null;
        }
        return response.json();
      })
      .then(function (err) {
        if (!err) { return; } // success path
        if (err.code === '23505') {
          formMessage.textContent = 'You\'re already registered — check your inbox!';
          formMessage.style.color = '#e67e22';
        } else {
          formMessage.textContent = 'Something went wrong. Please try again.';
          formMessage.style.color = '#c0392b';
        }
      })
      .catch(function () {
        formMessage.textContent = 'Network error. Please check your connection and try again.';
        formMessage.style.color = '#c0392b';
      })
      .finally(function () {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Send Me the Prayer Focus Guide';
        formMessage.style.display = 'block';
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  }

}());
