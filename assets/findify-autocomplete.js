const initFindifyAutocompleteEvents = () => {
  let selector = "input[name='q']";
  let rid, q, item_limit;

  if (findify) {
    let meta = findify.autocomplete.state.meta;
    rid = meta.rid;
    q = meta.q;
    item_limit = meta.item_limit;
  }

  const redirectionFeedback = async (query, rid) => {
    try {
      findify.core.analytics.sendEvent("redirect", {
        rid,
        suggestion: query,
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  /**
   *
   * @param {*} url destination to navigat to
   * @param {*} e event
   * @param {*} query search term
   * @param {*} rid last request id
   * @returns
   */
  const navigate = (url, e, query, rid) => {
    const openInNewWindow = e && (e.ctrlKey || e.metaKey);
    const redirections = findify.core.merchantConfig.redirections;
    const redirectionURL =
      redirections && redirections[query] ? redirections[query] : url;

    if (redirections && redirections[query]) redirectionFeedback(query, rid);
    if (window) {
      if (openInNewWindow) window.open(redirectionURL, "_blank");
      window.location.href = redirectionURL;
    }
  };

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onSearch = (e) => {
    preventDefaults(e);
    const query = e.target.value;
    navigate(`/search?q=${query}`, e, query);
  };

  const initSuggestionAnalytics = async (e, suggestion, properties) => {
    const { q: query, rid } = findify.autocomplete.state.meta;
    try {
      findify.core.analytics.sendEvent("click-suggestion", {
        rid,
        suggestion: suggestion,
      });
    } catch (error) {
      console.log("error", error);
    }
    return navigate(properties.href, e, query, rid);
  };

  const initOnSuggestionEvents = () => {
    document
      .querySelectorAll(".findify-autocomplete [data-findify-suggestion]")
      .forEach((i) => {
        i.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const suggestion = e.target?.innerText;
          const properties = {
            href: e.target.href,
          };
          initSuggestionAnalytics(e, suggestion, properties);
        });
      });
  };

  const getBottom = (el) => {
    const { bottom } = el.getBoundingClientRect();
    return bottom;
  };

  const setAutocompletePosition = (input) => {
    const top = getBottom(input) + 2;
    const autocomplete = document.querySelector(".findify-autocomplete");
    autocomplete.style.top = `${top}px`;
  };

  const closeAutocomplete = (e, isEscape) => {
    if (
      isEscape ||
      !document
        .querySelector(".findify-autocomplete")
        .className.includes("hidden")
    ) {
      document.querySelector(".findify-autocomplete").className += " hidden";
    }
  };

  const closeAutocompleteOutside = (e, input) => {
    const findifyAutocomplete = document.querySelector(".findify-autocomplete");
    if (!findifyAutocomplete.contains(e.target) && !input.contains(e.target)) {
      closeAutocomplete(e);
      document.removeEventListener("click", closeAutocompleteOutside);
    }
  };

  const openAutocomplete = (input) => {
    const autocompleteClassName = document.querySelector(
      ".findify-autocomplete"
    ).className;
    document.querySelector(".findify-autocomplete").className =
      autocompleteClassName.replace(" hidden", "");
    document
      .querySelector(".findify-close-autocomplete")
      ?.addEventListener("click", (e) => closeAutocomplete(e));
    document.addEventListener("click", (e) =>
      closeAutocompleteOutside(e, input)
    );
    setAutocompletePosition(input);
  };

  /**
   * Not yet in use. Not yet implemented.
   * @param {*} content
   */
  const renderContent = (content) => {
    const cardTemplate = document.querySelector(".content-item").outerHTML;
    const container = document.querySelector(
      ".findify-autocomplete-content .content-container"
    ).innerHTML;
    document.querySelector(
      ".findify-autocomplete-content .content-container"
    ).innerHTML = "";

    content[this.contentID].forEach((item) => {
      let card = cardTemplate;
      const keys = Object.keys(item);

      keys.forEach((key) => {
        card = card.replace(`{findify_${key}}`, item[key]);
        return card;
      });

      document.querySelector(
        ".findify-autocomplete-content .content-container"
      ).innerHTML += card;
    });
  };

  const loadFindifyAutocomplete = async (event) => {
    const hasQueryChanged = !event || event.target.value !== q;

    if (hasQueryChanged) {
      q = event ? event.target.value : "";
      event.target.removeEventListener("focus", loadFindifyAutocomplete);
      event.target.removeEventListener("keyup", handleFindifyChange);
      latestResponse = await findify.autocomplete.api(q);
      rid = latestResponse.meta.rid;
      await findify.autocomplete.render(latestResponse);

      //if (this.contentID) this.renderContent(this.#latestResponse.content);
    }
    if (event.type == "focus")
      setTimeout(() => openAutocomplete(event.target), 200);
    else openAutocomplete(event.target);
  };

  const msDelay = 500;
  const delay = (fn, ms) => {
    let timer;
    return {
      call(...args) {
        clearTimeout(timer);
        timer = setTimeout(fn.bind(this, ...args), ms || 0);
      },

      cancel() {
        clearTimeout(timer);
      },
    };
  };

  const delayLoadFindifyAutocomplete = delay(loadFindifyAutocomplete, msDelay);

  const handleFindifyChange = (e) => {
    if (e.code == "Enter") {
      onSearch(e);
    } else if (e.code == "Escape") {
      closeAutocomplete(e, true);
    } else {
      delayLoadFindifyAutocomplete.cancel();
      delayLoadFindifyAutocomplete.call(e);
    }
  };

  const initializeFindifyAutocomplete = () => {
    const inputDomRefs = document.querySelectorAll(selector);
    inputDomRefs.forEach((input) => {
      input.addEventListener("focus", loadFindifyAutocomplete);
      input.addEventListener("keyup", handleFindifyChange);
    });
    initOnSuggestionEvents();
  };

  const initializeFullscreenAutocomplete = () => {
    if (item_limit && item_limit > 4)
      document.querySelector(".findify-autocomplete").style.height = "100%";
    initializeFindifyAutocomplete();
  };

  initializeFullscreenAutocomplete();
};
