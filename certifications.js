/**
 * certifications.js — Preetham N · Certifications Page
 * =====================================================
 * Features:
 *  1. Loads certifications.json
 *  2. Renders a stacked card deck with floating animation
 *  3. Click deck → cards fly to responsive grid (FLIP logo animation)
 *  4. Each card: image, logo badge (top-right), name, bullets
 *  5. 3D tilt on hover
 *  6. Lightbox on card click
 *  7. Filter pills (All / Java / Networking / Competitive / DevOps)
 *  8. "Stack them back" reverses everything
 *  9. prefers-reduced-motion: simple fades
 * 10. Theme picker (synced to localStorage)
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     UTILITY
  ───────────────────────────────────────────── */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────
     STATE
  ───────────────────────────────────────────── */
  let CERTS   = [];      // data from JSON
  let expanded = false;

  /* ─────────────────────────────────────────────
     DOM REFS
  ───────────────────────────────────────────── */
  const deck         = $('#deck');
  const logoCluster  = $('#logoCluster');
  const deckCount    = $('#deckCount');
  const certCount    = $('#certCount');
  const deckSection  = $('#deckSection');
  const gridSection  = $('#gridSection');
  const certGrid     = $('#certGrid');
  const stackBtn     = $('#stackBtn');
  const lightbox     = $('#lightbox');
  const lbBackdrop   = $('#lbBackdrop');
  const lbClose      = $('#lbClose');
  const lbImg        = $('#lbImg');
  const lbName       = $('#lbName');
  const filterBar    = $('#filterBar');

  /* ─────────────────────────────────────────────
     THEME PICKER
  ───────────────────────────────────────────── */
  const THEME_KEY = 'preetham_theme_choice';
  const themeBtn  = $('#themeBtn');
  const themeMenu = $('#themeMenu');

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    document.body.setAttribute('data-theme', t);
    document.body.className = t === 'warm' ? 'light-theme' : 'dark-theme';
    $$('.c-theme-opt', themeMenu).forEach(o => o.classList.toggle('active', o.dataset.theme === t));
    localStorage.setItem(THEME_KEY, t);
  }

  applyTheme(localStorage.getItem(THEME_KEY) || 'obsidian');

  themeBtn.addEventListener('click', e => {
    e.stopPropagation();
    themeMenu.hidden = !themeMenu.hidden;
  });
  themeMenu.addEventListener('click', e => {
    const opt = e.target.closest('.c-theme-opt');
    if (opt) { applyTheme(opt.dataset.theme); themeMenu.hidden = true; }
  });
  document.addEventListener('click', e => {
    if (!themeMenu.hidden && !themeMenu.contains(e.target) && e.target !== themeBtn) {
      themeMenu.hidden = true;
    }
  });

  /* ─────────────────────────────────────────────
     FILTER TAGS (which certs belong to which filter)
  ───────────────────────────────────────────── */
  const FILTER_MAP = {
    java:        ['redhat', 'oracle'],
    networks:    ['nptel', 'cisco'],
    competitive: ['codechef'],
  };

  /* ─────────────────────────────────────────────
     BUILD DECK FRONT CARD
  ───────────────────────────────────────────── */
  function buildDeckFront() {
    // Update counts
    if (deckCount) deckCount.textContent = `${CERTS.length} certifications`;
    if (certCount) certCount.textContent = CERTS.length;

    // Populate logo cluster on front card
    logoCluster.innerHTML = '';
    CERTS.forEach(cert => {
      const badge = document.createElement('div');
      badge.className = 'c-logo-badge';
      badge.dataset.certId = cert.id;
      badge.textContent = cert.logoInitials;
      badge.title = cert.issuerShort;
      badge.setAttribute('aria-label', cert.issuerShort);
      badge.style.cssText = `color:${cert.logoColor}; background:${cert.logoBg}; border-color:${cert.logoColor};`;
      logoCluster.appendChild(badge);
    });
  }

  /* ─────────────────────────────────────────────
     BUILD GRID CARDS
  ───────────────────────────────────────────── */
  function buildGrid() {
    certGrid.innerHTML = '';
    CERTS.forEach(cert => {
      const card = document.createElement('article');
      card.className  = 'c-card';
      card.dataset.certId = cert.id;
      card.setAttribute('role', 'listitem');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${cert.name} — click to view`);
      // Set accent CSS variable per card
      card.style.setProperty('--card-accent', cert.accent || cert.logoColor);

      const hasPdf = false; // PDF section removed

      card.innerHTML = `
        <!-- Thumbnail -->
        <div class="c-card__img-wrap">
          <img class="c-card__img"
               src="${cert.image}"
               alt="${cert.name} certificate"
               loading="lazy"
               onerror="this.parentElement.style.background='var(--bg-card-alt)'; this.style.display='none';" />
          ${hasPdf ? `<span class="c-card__pdf-tag">PDF</span>` : ''}
        </div>

        <!-- Floating logo badge — settled after fly-in -->
        <div class="c-card__logo" data-cert-id="${cert.id}"
             style="color:${cert.logoColor}; background:${cert.logoBg}; border-color:${cert.logoColor};"
             aria-hidden="true">${cert.logoInitials}</div>

        <!-- Text body -->
        <div class="c-card__body">
          <div class="c-card__name">${cert.name}</div>
          <div class="c-card__issuer">${cert.issuerShort}</div>
          <div class="c-card__meta">
            <span class="c-card__date">${cert.date}</span>
            ${cert.credentialId ? `<span class="c-card__id">· ${cert.credentialId}</span>` : ''}
          </div>
        </div>

        <!-- What I learned -->
        <div class="c-card__learned">
          <div class="c-card__learned-label">What I learned</div>
          <ul>${cert.learned.map(pt => `<li>${pt}</li>`).join('')}</ul>
        </div>
      `;

      certGrid.appendChild(card);
    });
  }

  /* ─────────────────────────────────────────────
     3D TILT EFFECT
  ───────────────────────────────────────────── */
  function attachTilt() {
    $$('.c-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        if (reducedMotion()) return;
        const r  = card.getBoundingClientRect();
        const dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
        const dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
        card.style.transform = `perspective(900px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) translateZ(6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ─────────────────────────────────────────────
     LIGHTBOX
  ───────────────────────────────────────────── */
  function openLightbox(cert) {
    lbImg.src  = cert.image;
    lbImg.alt  = cert.name;
    lbName.textContent = cert.name;
    lightbox.hidden = false;
    document.addEventListener('keydown', onLbKey);
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lbImg.src = '';
    document.removeEventListener('keydown', onLbKey);
  }

  function onLbKey(e) { if (e.key === 'Escape') closeLightbox(); }

  lbClose.addEventListener('click', closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);

  /* ─────────────────────────────────────────────
     ATTACH CARD CLICKS
  ───────────────────────────────────────────── */
  function attachCardClicks() {
    $$('.c-card').forEach(card => {
      card.addEventListener('click', () => {
        const cert = CERTS.find(c => c.id === card.dataset.certId);
        if (cert) openLightbox(cert);
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
      });
    });
  }

  /* ─────────────────────────────────────────────
     FILTER PILLS
  ───────────────────────────────────────────── */
  function attachFilters() {
    if (!filterBar) return;
    filterBar.addEventListener('click', e => {
      const btn = e.target.closest('.c-filter');
      if (!btn) return;
      $$('.c-filter', filterBar).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      $$('.c-card').forEach(card => {
        if (filter === 'all') {
          card.classList.remove('c-hidden');
        } else {
          const ids = FILTER_MAP[filter] || [];
          card.classList.toggle('c-hidden', !ids.includes(card.dataset.certId));
        }
      });
    });
  }

  /* ─────────────────────────────────────────────
     EXPAND: DECK → GRID
     Uses FLIP technique for logo animation
  ───────────────────────────────────────────── */
  function expand() {
    if (expanded) return;
    expanded = true;

    /* ── REDUCED MOTION: simple crossfade ── */
    if (reducedMotion()) {
      deckSection.setAttribute('hidden', '');
      gridSection.removeAttribute('hidden');
      gridSection.classList.add('c-visible');
      $$('.c-card__logo').forEach(el => el.classList.add('c-settled'));
      $$('.c-card').forEach(el => el.classList.add('c-bullets-in'));
      attachTilt(); attachCardClicks(); attachFilters();
      return;
    }

    /* ── Step 1: Record badge positions on front card (FIRST state) ── */
    const badgeRects = {};
    $$('.c-logo-badge', logoCluster).forEach(badge => {
      const r = badge.getBoundingClientRect();
      badgeRects[badge.dataset.certId] = { x: r.left + r.width/2, y: r.top + r.height/2, w: r.width, h: r.height };
    });

    /* ── Step 2: Switch to grid (LAST state) ── */
    deckSection.setAttribute('hidden', '');
    gridSection.removeAttribute('hidden');
    // Force layout
    void certGrid.offsetWidth;

    /* ── Step 3: Record where logo badges WILL be on grid cards ── */
    const logoRects = {};
    $$('.c-card__logo').forEach(logo => {
      const r = logo.getBoundingClientRect();
      logoRects[logo.dataset.certId] = { x: r.left + r.width/2, y: r.top + r.height/2, w: r.width, h: r.height };
    });

    /* ── Step 4: Create flying clones at FIRST positions ── */
    const flyers = [];
    CERTS.forEach((cert, i) => {
      const src = badgeRects[cert.id];
      const dst = logoRects[cert.id];
      if (!src || !dst) return;

      const flyer = document.createElement('div');
      flyer.className = 'c-flyer';
      flyer.textContent = cert.logoInitials;
      flyer.style.cssText = `
        width:${src.w}px; height:${src.h}px;
        left:${src.x - src.w/2}px; top:${src.y - src.h/2}px;
        color:${cert.logoColor}; background:${cert.logoBg}; border-color:${cert.logoColor};
        font-size:${Math.round(src.w * 0.11)}px;
      `;
      document.body.appendChild(flyer);
      flyers.push({ flyer, cert, src, dst, delay: i * 55 });
    });

    /* ── Step 5: Fade in grid, then animate flyers to LAST positions ── */
    requestAnimationFrame(() => {
      gridSection.classList.add('c-visible');

      requestAnimationFrame(() => {
        flyers.forEach(({ flyer, dst, delay, src }) => {
          const dw = dst.w, dh = dst.h;
          flyer.style.transition = `
            left   0.7s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms,
            top    0.7s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms,
            width  0.7s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms,
            height 0.7s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms,
            transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms
          `;
          flyer.style.left   = `${dst.x - dw/2}px`;
          flyer.style.top    = `${dst.y - dh/2}px`;
          flyer.style.width  = `${dw}px`;
          flyer.style.height = `${dh}px`;
          // Mid-flight rotation for organic feel
          flyer.style.transform = `rotate(${Math.random() > 0.5 ? 360 : -360}deg) scale(1)`;
        });

        // After all flyers arrive → reveal card logos with bounce, fade out flyers
        const maxDelay = (CERTS.length - 1) * 55 + 750;

        setTimeout(() => {
          flyers.forEach(({ flyer, cert }) => {
            // Find card logo and settle it
            const logo = $(`.c-card__logo[data-cert-id="${cert.id}"]`);
            if (logo) logo.classList.add('c-settled');
            flyer.remove();
          });
        }, maxDelay);

        // Stagger bullet reveals per card
        $$('.c-card').forEach((card, i) => {
          setTimeout(() => card.classList.add('c-bullets-in'), maxDelay + 100 + i * 70);
        });
      });
    });

    attachTilt();
    attachCardClicks();
    attachFilters();
  }

  /* ─────────────────────────────────────────────
     COLLAPSE: GRID → DECK
  ───────────────────────────────────────────── */
  function collapse() {
    if (!expanded) return;
    expanded = false;

    if (reducedMotion()) {
      gridSection.classList.remove('c-visible');
      gridSection.setAttribute('hidden', '');
      deckSection.removeAttribute('hidden');
      $$('.c-card__logo').forEach(el => el.classList.remove('c-settled'));
      $$('.c-card').forEach(el => el.classList.remove('c-bullets-in'));
      return;
    }

    /* ── Reverse: logos fly from card corners back to cluster ── */

    // Record FIRST (card corner) positions
    const logoRects = {};
    $$('.c-card__logo').forEach(logo => {
      const r = logo.getBoundingClientRect();
      logoRects[logo.dataset.certId] = { x: r.left + r.width/2, y: r.top + r.height/2, w: r.width, h: r.height };
    });

    // Hide logos on cards
    $$('.c-card__logo').forEach(el => el.classList.remove('c-settled'));
    $$('.c-card').forEach(el => el.classList.remove('c-bullets-in'));

    // Switch back to deck section
    gridSection.classList.remove('c-visible');
    setTimeout(() => {
      gridSection.setAttribute('hidden', '');
      deckSection.removeAttribute('hidden');

      // Record LAST (badge cluster) positions
      const clusterRects = {};
      $$('.c-logo-badge', logoCluster).forEach(badge => {
        const r = badge.getBoundingClientRect();
        clusterRects[badge.dataset.certId] = { x: r.left + r.width/2, y: r.top + r.height/2, w: r.width, h: r.height };
      });

      // Create flyers at card corner positions, fly them home
      CERTS.forEach((cert, i) => {
        const src = logoRects[cert.id];
        const dst = clusterRects[cert.id];
        if (!src || !dst) return;

        const flyer = document.createElement('div');
        flyer.className = 'c-flyer';
        flyer.textContent = cert.logoInitials;
        flyer.style.cssText = `
          width:${src.w}px; height:${src.h}px;
          left:${src.x - src.w/2}px; top:${src.y - src.h/2}px;
          color:${cert.logoColor}; background:${cert.logoBg}; border-color:${cert.logoColor};
          font-size:${Math.round(src.w * 0.11)}px;
        `;
        document.body.appendChild(flyer);

        const delay = i * 40;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          flyer.style.transition = `
            left 0.6s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms,
            top  0.6s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms,
            width  0.6s ease ${delay}ms, height 0.6s ease ${delay}ms,
            transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms,
            opacity 0.3s ease ${delay + 500}ms
          `;
          flyer.style.left   = `${dst.x - dst.w/2}px`;
          flyer.style.top    = `${dst.y - dst.h/2}px`;
          flyer.style.width  = `${dst.w}px`;
          flyer.style.height = `${dst.h}px`;
          flyer.style.transform = `rotate(${360}deg)`;
          flyer.style.opacity = '0';
          setTimeout(() => flyer.remove(), delay + 800);
        }));
      });

    }, 400);
  }

  /* ─────────────────────────────────────────────
     DECK: CLICK + KEYBOARD
  ───────────────────────────────────────────── */
  deck.addEventListener('click', expand);
  deck.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); expand(); }
  });
  stackBtn.addEventListener('click', collapse);

  /* ─────────────────────────────────────────────
     RESIZE GUARD
     If window resizes while grid is shown, re-read logo positions next time.
  ───────────────────────────────────────────── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Cards auto-reflow via CSS Grid — nothing extra needed.
      // The logo badges are position:absolute so they may drift;
      // just ensure no overflow by confirming grid width.
      if (expanded && certGrid) {
        // logo badges are relative to their card — CSS handles repositioning
      }
    }, 150);
  });

  /* ─────────────────────────────────────────────
     INIT: LOAD JSON → BUILD DOM
  ───────────────────────────────────────────── */
  async function init() {
    try {
      const res = await fetch('certifications.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      CERTS = await res.json();
    } catch (err) {
      console.error('[Certifications] Failed to load data:', err);
      // Show error state in deck
      const front = $('.c-deck__front');
      if (front) front.innerHTML = `<p style="color:var(--gold);font-size:.85rem;text-align:center;">
        Could not load certifications.<br>Please refresh the page.</p>`;
      return;
    }

    buildDeckFront();
    buildGrid();
  }

  init();

})();
