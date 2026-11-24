/**
 * Sanjay Shekar - Portfolio Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const menuToggle = document.getElementById('menuToggle');
  const sideDrawer = document.getElementById('sideDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const drawerLinks = document.querySelectorAll('.drawer-nav-item a');
  
  const resumeModal = document.getElementById('resumeModal');
  const openResumeBtns = document.querySelectorAll('.trigger-resume-modal');
  const closeResumeModalBtn = document.getElementById('closeResumeModalBtn');
  
  const contactForm = document.getElementById('contactForm');
  const toastMsg = document.getElementById('toastMsg');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  
// --------------------------------------------------------------------------
  // Theme Toggle (Dark / Light Theme)
  // --------------------------------------------------------------------------
  const themeToggle = document.getElementById('themeToggle');
  const storedTheme = localStorage.getItem('preetham_theme');
  
  // Default to dark theme as requested by user
  if (storedTheme === 'light') {
    document.body.classList.remove('dark-theme');
  } else {
    document.body.classList.add('dark-theme');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-theme');
      localStorage.setItem('preetham_theme', isDark ? 'dark' : 'light');
    });
  }

  // --------------------------------------------------------------------------
  // 1. Navigation Active State on Scroll (IntersectionObserver)
  // --------------------------------------------------------------------------
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => sectionObserver.observe(sec));

  // --------------------------------------------------------------------------
  // 2. Side Drawer Toggle
  // --------------------------------------------------------------------------
  function openDrawer() {
    sideDrawer.classList.add('active');
    drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    sideDrawer.classList.remove('active');
    drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuToggle) menuToggle.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // --------------------------------------------------------------------------
  // 3. Resume Modal Toggle
  // --------------------------------------------------------------------------
  function openModal() {
    resumeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    resumeModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  openResumeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeResumeModalBtn) closeResumeModalBtn.addEventListener('click', closeModal);
  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeModal();
    });
  }

  // Escape key closes modals/drawers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
      closeModal();
    }
  });

  // --------------------------------------------------------------------------
  // 4. Counter Number Animation
  // --------------------------------------------------------------------------
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let hasAnimatedStats = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimatedStats) {
        hasAnimatedStats = true;
        statNumbers.forEach(numEl => {
          const target = parseFloat(numEl.getAttribute('data-target'));
          const suffix = numEl.getAttribute('data-suffix') || '';
          const isDecimal = target % 1 !== 0;
          let current = 0;
          const duration = 1600;
          const steps = 60;
          const increment = target / steps;
          const stepTime = duration / steps;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            numEl.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.bottom-stats-banner');
  if (statsSection) statsObserver.observe(statsSection);

  // --------------------------------------------------------------------------
  // 5. Contact Form Submission
  // --------------------------------------------------------------------------
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('.form-submit-btn');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.innerHTML = `<span>Sending...</span>`;
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = `<span>Message Sent! ✓</span>`;
        submitBtn.style.background = '#10b981';
        submitBtn.style.color = '#ffffff';

        showToast("Thanks for reaching out! Sanjay will reply shortly.");
        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.style.color = '';
          submitBtn.disabled = false;
        }, 3000);
      }, 900);
    });
  }

  function showToast(message) {
    if (!toastMsg) return;
    toastMsg.textContent = message;
    toastMsg.classList.add('show');
    setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 4000);
  }

  // --------------------------------------------------------------------------
  // 6. Watermark subtle mouse movement effect
  // --------------------------------------------------------------------------
  const watermark = document.querySelector('.hero-watermark');
  if (watermark) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      watermark.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });
  }
});


// Portrait Photo Switcher
document.addEventListener('DOMContentLoaded', () => {
  const portraitImg = document.getElementById('mainHeroPortrait');
  const switchBtns = document.querySelectorAll('.portrait-switch-btn');
  if (portraitImg && switchBtns.length > 0) {
    switchBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        switchBtns.forEach(b => {
          b.classList.remove('active');
          b.style.background = 'transparent';
          b.style.color = '#bbb';
        });
        btn.classList.add('active');
        btn.style.background = '#fff';
        btn.style.color = '#111';
        const newSrc = btn.getAttribute('data-img');
        portraitImg.style.opacity = '0';
        setTimeout(() => {
          portraitImg.src = newSrc;
          portraitImg.style.opacity = '1';
        }, 180);
      });
    });
  }
});

// --------------------------------------------------------------------------
  // Multi-Theme Selector Logic
  // --------------------------------------------------------------------------
  const themeDropdownBtn = document.getElementById('themeDropdownBtn');
  const themeDropdownMenu = document.getElementById('themeDropdownMenu');
  const themeOptionBtns = document.querySelectorAll('.theme-option-btn');

  // Load saved theme or default to obsidian
  const savedTheme = localStorage.getItem('preetham_theme_choice') || 'obsidian';
  applyTheme(savedTheme);

  function applyTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    if (themeName === 'light') {
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
    }
    localStorage.setItem('preetham_theme_choice', themeName);

    themeOptionBtns.forEach(btn => {
      if (btn.getAttribute('data-theme-val') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  if (themeDropdownBtn && themeDropdownMenu) {
    themeDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdownMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!themeDropdownMenu.contains(e.target) && e.target !== themeDropdownBtn) {
        themeDropdownMenu.classList.remove('active');
      }
    });

    themeOptionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedTheme = btn.getAttribute('data-theme-val');
        applyTheme(selectedTheme);
        themeDropdownMenu.classList.remove('active');
      });
    });
  }