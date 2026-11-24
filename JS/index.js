(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js-enabled');
  const header = document.querySelector('.site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const navigation = document.getElementById('site-navigation');
  const progress = document.getElementById('scroll-progress');
  const backToTop = document.getElementById('back-to-top');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopNavigation = window.matchMedia('(min-width: 900px)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  // A disclosure menu keeps the normal document and keyboard navigation intact.
  function setMenu(open, returnFocus = false) {
    if (!menuToggle || !navigation) return;
    const isOpen = open && !desktopNavigation.matches;
    const focusIsInside = navigation.contains(document.activeElement);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('is-open', isOpen);
    header?.classList.toggle('menu-open', isOpen);
    if (returnFocus || (!isOpen && !desktopNavigation.matches && focusIsInside)) {
      menuToggle.focus({ preventScroll: true });
    }
    navigation.inert = !desktopNavigation.matches && !isOpen;
  }

  menuToggle?.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });
  navigation?.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    if (!desktopNavigation.matches && link.getAttribute('href')?.startsWith('#')) {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }
    setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
      setMenu(false, true);
    }
  });
  document.addEventListener('click', (event) => {
    if (menuToggle?.getAttribute('aria-expanded') === 'true'
      && !navigation?.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenu(false);
    }
  });
  const onNavigationResize = () => {
    const focusWasInside = navigation?.contains(document.activeElement);
    setMenu(false, Boolean(focusWasInside && !desktopNavigation.matches));
  };
  if (desktopNavigation.addEventListener) {
    desktopNavigation.addEventListener('change', onNavigationResize);
  } else {
    desktopNavigation.addListener(onNavigationResize);
  }
  setMenu(false);

  const navigationLinks = [...(navigation?.querySelectorAll('a[href^="#"]') || [])];
  const linkedSections = navigationLinks.map((link) => ({
    link,
    section: document.getElementById(link.getAttribute('href').slice(1)),
  })).filter(({ section }) => section);
  let scheduledScroll = false;

  function updateScroll() {
    scheduledScroll = false;
    const scrollTop = window.scrollY || root.scrollTop;
    const scrollableHeight = root.scrollHeight - window.innerHeight;
    header?.classList.toggle('is-scrolled', scrollTop > 24);
    if (progress) {
      progress.style.transform = `scaleX(${scrollableHeight > 0
        ? Math.min(1, Math.max(0, scrollTop / scrollableHeight)) : 0})`;
    }
    if (backToTop) {
      const isVisible = scrollTop > 650;
      backToTop.classList.toggle('is-visible', isVisible);
      backToTop.inert = !isVisible;
      backToTop.setAttribute('aria-hidden', String(!isVisible));
    }
    let active;
    const threshold = (header?.offsetHeight || 80) + 100;
    linkedSections.forEach((entry) => {
      if (entry.section.getBoundingClientRect().top <= threshold) active = entry;
    });
    if (scrollableHeight > 0 && scrollTop >= scrollableHeight - 8) {
      active = linkedSections[linkedSections.length - 1];
    }
    linkedSections.forEach(({ link }) => {
      const isActive = link === active?.link;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleScrollUpdate() {
    if (scheduledScroll) return;
    scheduledScroll = true;
    window.requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  window.addEventListener('resize', scheduleScrollUpdate, { passive: true });
  window.addEventListener('load', updateScroll, { once: true });
  updateScroll();

  // Reveal once, and never hide content when motion or observation is unavailable.
  const revealTargets = [...document.querySelectorAll('[data-reveal]')];
  let revealObserver;
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add('is-visible');
        revealObserver.unobserve(target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
    root.classList.add('motion-ready');
    revealTargets.forEach((target) => revealObserver.observe(target));
  }

  const heroVisual = document.querySelector('.hero-visual');
  const motionToggle = document.getElementById('motion-toggle');
  let motionPaused = false;
  const motionIsPaused = () => motionPaused || reducedMotion.matches;
  let pointerFrame = 0;
  function resetPointer() {
    window.cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    heroVisual?.style.setProperty('--pointer-x', '0px');
    heroVisual?.style.setProperty('--pointer-y', '0px');
  }
  heroVisual?.addEventListener('pointermove', (event) => {
    if (motionIsPaused() || !finePointer.matches) return;
    window.cancelAnimationFrame(pointerFrame);
    const { clientX, clientY } = event;
    pointerFrame = window.requestAnimationFrame(() => {
      const bounds = heroVisual.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = Math.max(-1, Math.min(1, (clientX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (clientY - bounds.top) / bounds.height * 2 - 1));
      heroVisual.style.setProperty('--pointer-x', `${(x * 8).toFixed(2)}px`);
      heroVisual.style.setProperty('--pointer-y', `${(y * 8).toFixed(2)}px`);
      pointerFrame = 0;
    });
  }, { passive: true });
  heroVisual?.addEventListener('pointerleave', resetPointer);
  function updateMotionControl() {
    const paused = motionIsPaused();
    resetPointer();
    root.classList.toggle('motion-paused', paused);
    if (motionToggle) {
      motionToggle.hidden = false;
      motionToggle.disabled = reducedMotion.matches;
      motionToggle.setAttribute('aria-pressed', String(paused));
      motionToggle.textContent = reducedMotion.matches
        ? 'Motion reduced' : motionPaused ? 'Resume motion' : 'Pause motion';
    }
    if (paused) {
      root.classList.remove('motion-ready');
      revealObserver?.disconnect();
      revealTargets.forEach((target) => target.classList.add('is-visible'));
    }
  }
  motionToggle?.addEventListener('click', () => {
    motionPaused = !motionPaused;
    updateMotionControl();
  });
  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener('change', updateMotionControl);
    finePointer.addEventListener('change', resetPointer);
  } else {
    reducedMotion.addListener(updateMotionControl);
    finePointer.addListener(resetPointer);
  }
  updateMotionControl();

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const projectCards = [...document.querySelectorAll('.project-card[data-category]')];
  const filterStatus = document.getElementById('project-filter-status');
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      let visibleCount = 0;
      filterButtons.forEach((filter) => {
        const isActive = filter === button;
        filter.setAttribute('aria-pressed', String(isActive));
        filter.classList.toggle('is-active', isActive);
      });
      projectCards.forEach((card) => {
        card.hidden = category !== 'all' && card.dataset.category !== category;
        if (!card.hidden) {
          visibleCount += 1;
          card.classList.add('is-visible');
          revealObserver?.unobserve(card);
        }
      });
      if (filterStatus) {
        filterStatus.textContent = `${visibleCount} ${category === 'all' ? '' : `${category} `}project${visibleCount === 1 ? '' : 's'} shown.`;
      }
      scheduleScrollUpdate();
    });
  });

  const dialog = document.getElementById('project-dialog');
  const dialogImage = document.getElementById('dialog-image');
  const dialogCaption = document.getElementById('dialog-caption');
  const dialogClose = document.getElementById('dialog-close');
  let dialogOpener;
  let dialogScroll = 0;

  document.querySelectorAll('[data-preview]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      if (!dialog || !dialogImage || typeof dialog.showModal !== 'function') {
        window.open(button.dataset.preview, '_blank', 'noopener,noreferrer');
        return;
      }
      dialogOpener = button;
      dialogScroll = window.scrollY;
      dialogImage.src = button.dataset.preview;
      dialogImage.alt = button.dataset.alt || button.dataset.title || 'Project preview';
      if (dialogCaption) dialogCaption.textContent = button.dataset.title || 'Project preview';
      dialog.showModal();
      document.body.classList.add('dialog-open');
      dialogClose?.focus({ preventScroll: true });
    });
  });
  dialogClose?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog?.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    dialogOpener?.focus({ preventScroll: true });
    // Temporarily bypass CSS smooth scrolling when restoring a lightbox's position.
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, dialogScroll);
    root.style.scrollBehavior = previousBehavior;
    if (dialogImage) dialogImage.removeAttribute('src');
  });

  const form = document.getElementById('contact-form');
  const submitButton = document.getElementById('contact-submit');
  const formStatus = document.getElementById('form-status');
  if (form && submitButton && formStatus && 'fetch' in window && 'FormData' in window) {
    const defaultButtonContent = [...submitButton.childNodes];
    let submitting = false;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (submitting || !form.reportValidity()) return;
      submitting = true;
      submitButton.disabled = true;
      submitButton.textContent = 'Sending…';
      form.setAttribute('aria-busy', 'true');
      formStatus.dataset.state = 'pending';
      formStatus.textContent = 'Sending your message…';
      const controller = 'AbortController' in window ? new AbortController() : null;
      let timeout;
      try {
        const request = fetch(form.action, {
          method: form.method || 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
          ...(controller ? { signal: controller.signal } : {}),
        });
        const deadline = new Promise((resolve, reject) => {
          timeout = window.setTimeout(() => {
            controller?.abort();
            reject(new Error('timeout'));
          }, 15000);
        });
        const response = await Promise.race([request, deadline]);
        if (!response.ok) throw new Error('submission-failed');
        form.reset();
        formStatus.dataset.state = 'success';
        formStatus.textContent = 'Thank you! Your message has been sent.';
      } catch (error) {
        formStatus.dataset.state = 'error';
        formStatus.textContent = error.name === 'AbortError' || error.message === 'timeout'
          ? 'The request timed out. Your message is still here. Try again, or email kazishayem1234@gmail.com.'
          : 'Your message could not be sent. Your text is still here. Try again, or email kazishayem1234@gmail.com.';
      } finally {
        window.clearTimeout(timeout);
        submitting = false;
        submitButton.disabled = false;
        submitButton.replaceChildren(...defaultButtonContent);
        form.removeAttribute('aria-busy');
      }
    });
  }

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();
