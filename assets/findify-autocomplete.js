/* Removed header/dimming logic; styles now computed relative to input element */

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

const getBottom = (el) => {
    const { bottom } = el.getBoundingClientRect();
    return bottom;
};

const setAutocompletePosition = (input) => {
    const top = getBottom(input) + 2;
    const autocomplete = document.querySelector('.findify-autocomplete');
    if (!autocomplete) return;
    autocomplete.style.top = `${top}px`;
    autocomplete.style.height = `max-content`;
    autocomplete.style.maxHeight = `calc(100vh - ${top}px)`;
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
    setAutocompletePosition(input);
    document.addEventListener(`keydown`, initTrapFocus);
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