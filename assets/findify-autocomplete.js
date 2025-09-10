const getDesktopOffset = () => {
  return document.getElementsByClassName('header__bottom-navigation')[0]?.offsetHeight || 0;
}

const getTop = () => {
  return `calc(var(--header-height, 0px) * var(--enable-sticky-header) + var(--announcement-bar-height, 0px) * var(--enable-sticky-announcement-bar) - ${getDesktopOffset()}px)`;
}

const disableBackgroundScroll = () => {
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';

  const scrollableContent = document.querySelector('.findify-autocomplete');
  if (scrollableContent) {
    scrollableContent.style.height = `calc(100dvh - ${getTop()} - 1rem)`;
    scrollableContent.style.overflowY = 'auto';
  }
}

const enableBackgroundScroll = () => {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';

  const scrollableContent = document.querySelector('.findify-autocomplete');
  if (scrollableContent) {
    scrollableContent.style.height = 'max-content';
    scrollableContent.style.overflow = '';
  }
}

const setStickyHeader = () => {
  const header = document.querySelector('.shopify-section--header');
  if (!header) return;

  header.style.position = 'sticky';
  header.style.top = 'calc(var(--enable-sticky-announcement-bar, 0) * var(--announcement-bar-height, 0px))';
  header.style.zIndex = '4';

  document.documentElement.style.setProperty('--enable-sticky-header', '1');
  document.documentElement.style.setProperty('--enable-sticky-announcement-bar', '1');
};

const removeStickyHeader = () => {
  const header = document.querySelector('.shopify-section--header');
  if (!header) return;

  header.style.position = '';
  header.style.top = '';
  header.style.zIndex = '';

  document.documentElement.style.setProperty('--enable-sticky-header', '0');
  document.documentElement.style.setProperty('--enable-sticky-announcement-bar', '0');
};

const dimBackground = () => {
  const headerSection = document.querySelector('.shopify-section--header');
  if (headerSection) {
    const visibleElement = Array.from(headerSection.querySelectorAll('.vetapet_search_form'))
      .find(el => window.getComputedStyle(el).display !== 'none');

    if (visibleElement) {
      if (window.getComputedStyle(headerSection).position === 'static') {
        headerSection.style.position = 'relative';
      }

      if (!headerSection.querySelector('.header-dim-overlay')) {
        const dimOverlay = document.createElement('div');
        dimOverlay.classList.add('header-dim-overlay');
        Object.assign(dimOverlay.style, {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          pointerEvents: 'none',
        });
        headerSection.appendChild(dimOverlay);
      }

      visibleElement.style.position = 'relative';
      visibleElement.style.zIndex = 9999;

      const parent = visibleElement.parentElement;
      if (parent) {
        Array.from(parent.children).forEach((child) => {
          if (child !== visibleElement) {
            child.style.pointerEvents = 'none';
          }
        });
      }
    }
  }

  const findifyElement = document.getElementById('findify-autocomplete');
  if (findifyElement && !document.querySelector('.findify-dim-overlay')) {
    const dimOverlay = document.createElement('div');
    dimOverlay.classList.add('findify-dim-overlay');

    Object.assign(dimOverlay.style, {
      position: 'fixed',
      bottom: '0',
      left: '0',
      width: '100%',
      height: `calc(100dvh - ${getTop()} - ${getDesktopOffset() > 0 ? '2rem' : '0px'})`,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9998,
      pointerEvents: 'none',
    });

    findifyElement.parentElement.insertBefore(dimOverlay, findifyElement);
  }
};

const resetDimBackground = () => {
  document.querySelector('.header-dim-overlay')?.remove();
  document.querySelector('.findify-dim-overlay')?.remove();

  const headerSection = document.querySelector('.shopify-section--header');
  if (headerSection) {
    const visibleElement = Array.from(headerSection.querySelectorAll('.vetapet_search_form'))
      .find(el => window.getComputedStyle(el).display !== 'none');

    if (visibleElement) {
      visibleElement.style.position = '';
      visibleElement.style.zIndex = '';

      const parent = visibleElement.parentElement;
      if (parent) {
        Array.from(parent.children).forEach((child) => {
          if (child !== visibleElement) {
            child.style.pointerEvents = '';
          }
        });
      }
    }
  }
};

/* ----------------------------
   Autocomplete initialization
   ---------------------------- */

const initFindifyAutocompleteEvents = () => {
  let selector = "input[name='q']";
  let rid, q, item_limit;
  let activeInput;

  // Counter to ignore stale requests
  let latestRequestId = 0;

  // make debounce faster; change if needed
  const msDelay = 250;

  const getSearchDestination = (query) => {
    const root = window.Shopify?.routes?.root ? window.Shopify.routes.root : '';
    return `${root}search?q=${encodeURIComponent(query)}`;
  };

  if (findify) {
    let meta = findify.autocomplete.state.meta;
    rid = meta.rid;
    q = meta.q;
    item_limit = meta.item_limit;
  }

  const redirectionFeedback = async (query, rid) => {
    try {
      findify.core.analytics.sendEvent('redirect', {
        rid,
        suggestion: query,
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  const navigate = (e, query, rid) => {
    const url = getSearchDestination(query);
    const openInNewWindow = e && (e.ctrlKey || e.metaKey);
    const redirections = findify.core.merchantConfig.redirections;
    const redirectionURL = redirections && redirections[query] ? redirections[query] : url;

    if (redirections && redirections[query]) redirectionFeedback(query, rid);
    if (window) {
      if (openInNewWindow) window.open(redirectionURL, '_blank');
      else window.location.href = redirectionURL;
    }
  };

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onSearch = (e) => {
    preventDefaults(e);
    const query = e.target.value;
    navigate(e, query);
  };

  const initSuggestionAnalytics = async (e, suggestion) => {
    const { q: query, rid } = findify.autocomplete.state.meta;
    try {
      findify.core.analytics.sendEvent('click-suggestion', {
        rid,
        suggestion: suggestion,
      });
    } catch (error) {
      console.log('error', error);
    }
    return navigate(e, suggestion, rid);
  };

  const initOnSuggestionEvents = () => {
    document
      .querySelectorAll('.findify-autocomplete [data-findify-suggestion]')
      .forEach((i) => {
        // remove previous listener by cloning to avoid duplicates
        const clone = i.cloneNode(true);
        i.parentNode.replaceChild(clone, i);
        clone.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const suggestion = e.target?.innerText;
          initSuggestionAnalytics(e, suggestion);
        });
      });
  };

  const setAutocompletePosition = () => {
    const top = getTop();
    const offset = getDesktopOffset() > 0 ? '2rem' : '0px';
    const autocomplete = document.querySelector('.findify-autocomplete');
    if (!autocomplete) return;
    autocomplete.style.top = top;
    autocomplete.style.height = `max-content`;
    autocomplete.style.maxHeight = `calc(100dvh - ${top} - ${offset})`;
    autocomplete.style.width = `calc(100vw - 2rem)`;
    autocomplete.style.maxWidth = '1700px';
    autocomplete.style.left = '0';
    autocomplete.style.right = '0';
    autocomplete.style.margin = '0 auto';
    autocomplete.style.overflow = 'hidden auto';
    autocomplete.style.borderRadius = '8px';
  };

  const closeAutocomplete = (e, isEscape) => {
    const ac = document.querySelector('.findify-autocomplete');
    if (!ac) return;

    if (
      isEscape ||
      !ac.classList.contains('findify-hidden')
    ) {
      ac.classList.add('findify-hidden');
      activeInput?.parentNode?.querySelector('button[type="submit"]')?.focus();
    }
    document.removeEventListener(`keydown`, initTrapFocus);
    removeStickyHeader();
    resetDimBackground();
    enableBackgroundScroll();
  };

  const closeAutocompleteOutside = (e, input) => {
    const findifyAutocomplete = document.querySelector('.findify-autocomplete');
    if (!findifyAutocomplete) return;
    if (!findifyAutocomplete.contains(e.target) && !input.contains(e.target)) {
      closeAutocomplete(e);
      document.removeEventListener('click', closeAutocompleteOutside);
    }
  };

  const initTrapFocus = (e) => {
    const isTabPressed = e.key === `Tab` || e.keyCode === 9;
    if (!isTabPressed) return;

    const modal = document.querySelector(".findify-autocomplete");
    if (!modal) return;

    const focusableElements = `a, button, [href], input:not([type="hidden"]), select, textarea, iframe, [tabindex]:not([tabindex="-1"])`;
    const focusableContent = modal.querySelectorAll(focusableElements);
    if (!focusableContent.length) return;

    const firstFocusableElement = focusableContent[0];
    const lastFocusableElement = focusableContent[focusableContent.length - 1];

    if (document.activeElement === activeInput) {
      firstFocusableElement.focus();
      e.preventDefault();
      return;
    }

    if (e.shiftKey) {
      if (document.activeElement === firstFocusableElement) {
        activeInput.focus();
        e.preventDefault();
      }
    } else if (document.activeElement === lastFocusableElement) {
      firstFocusableElement.focus();
      e.preventDefault();
    }
  };

  const openAutocomplete = (input) => {
    activeInput = input;
    const ac = document.querySelector('.findify-autocomplete');
    if (!ac) return;

    ac.classList.remove('findify-hidden');

    // attach close button handler once
    const closeBtn = document.querySelector('.findify-close-autocomplete');
    if (closeBtn && !closeBtn.dataset.findifyAttached) {
      closeBtn.addEventListener('click', (e) => closeAutocomplete(e));
      closeBtn.dataset.findifyAttached = '1';
    }

    document.addEventListener('click', (e) => closeAutocompleteOutside(e, input));
    setAutocompletePosition();
    document.addEventListener(`keydown`, initTrapFocus);
    setStickyHeader();
    dimBackground();
    disableBackgroundScroll();
  };

  const loadFindifyAutocomplete = async (event) => {
    // don't remove event listeners here — keep them for subsequent typing
    const hasQueryChanged = !event || event.target.value !== q;
    if (hasQueryChanged) {
      q = event ? event.target.value : '';
      // increment request id and capture it locally to detect stale responses
      const thisRequestId = ++latestRequestId;

      try {
        const response = await findify.autocomplete.api(q);
        // ignore stale responses
        if (thisRequestId !== latestRequestId) return;

        rid = response.meta?.rid || rid;
        await findify.autocomplete.render(response, findify.autocomplete.liquid);

        // attach suggestion click handlers for newly rendered items
        initOnSuggestionEvents();
      } catch (err) {
        console.log('findify autocomplete api error', err);
      }
    }

    if (event && event.type === 'focus') {
      setTimeout(() => openAutocomplete(event.target), 200);
    } else if (event && event.target) {
      openAutocomplete(event.target);
    } else {
      // fallback open
      const anyInput = document.querySelector(selector);
      if (anyInput) openAutocomplete(anyInput);
    }
  };

  // simple debounce helper
  const delay = (fn, ms) => {
    let timer;
    return {
      call(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), ms || 0);
      },
      cancel() {
        clearTimeout(timer);
      },
    };
  };

  const delayLoadFindifyAutocomplete = delay(loadFindifyAutocomplete, msDelay);

  const handleFindifyChange = (e) => {
    if (e.code === 'Enter' || e.key === 'Enter') {
      onSearch(e);
    } else if (e.code === 'Escape' || e.key === 'Escape') {
      closeAutocomplete(e, true);
    } else {
      delayLoadFindifyAutocomplete.cancel();
      delayLoadFindifyAutocomplete.call(e);
    }
  };

  const initializeFindifyAutocomplete = () => {
    const inputDomRefs = document.querySelectorAll(selector);
    inputDomRefs.forEach((input) => {
      // attach handlers if not already attached (prevent duplicates)
      if (!input._findifyInitialized) {
        input.addEventListener('focus', loadFindifyAutocomplete);
        input.addEventListener('keyup', handleFindifyChange);
        input._findifyInitialized = true;
      }
    });
    initOnSuggestionEvents();
  };

  const initializeFullscreenAutocomplete = () => {
    if (item_limit && item_limit > 4) {
      const ac = document.querySelector('.findify-autocomplete');
      if (ac) ac.style.height = '100%';
    }
    initializeFindifyAutocomplete();
  };

  initializeFullscreenAutocomplete();
};
