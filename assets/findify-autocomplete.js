
const initFindifyAutocompleteEvents = () => {
  let selector = "input[name='q']";
  let rid, q, item_limit;
  
  if(Findify) {
      let meta = Findify?.state?.autocomplete?.meta;
      rid = meta.rid;
      q = meta.q;
      item_limit = meta.item_limit; 
  } 

  const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation(); 
  };

  const redirectionFeedback = async (query)  => {
      try {
        Findify.analytics.sendEvent('redirect', {
          rid,
          suggestion: query,
        })
      } catch (error) {
        console.log('error', error);
      }
  };

  const navigate = async (url, e, query) => {
      const openInNewWindow = e && (e.ctrlKey || e.metaKey);
      const redirections = Findify.merchantConfig.redirections;
      const redirectionURL = redirections && redirections[query] ? redirections[query] : url;
  
      if (redirections && redirections[query]) redirectionFeedback(query);
      if (!window) return;
      if (openInNewWindow) return window.open(redirectionURL, '_blank');
  
      return window.location.href = redirectionURL;
  };

  const onSearch = (e) => {
      preventDefaults(e);
      const query = document.querySelector(selector).value;
      navigate(`/search?q=${query}`, e, query);
  };

  const onSuggestionClick = async (e) => {
      preventDefaults(e);
      const suggestion = e.target?.innerText;
      try {
        Findify.analytics.sendEvent('click-suggestion', {
          rid,
          suggestion: suggestion,
        })
      } catch (error) {
        console.log('error', error);
      }
      return navigate(e.target.href, e);
  };

  const onProductCardClick = async (e) => {
      preventDefaults(e);
  
      const itemID = e.target?.closest('[data-findify-product-card]').getAttribute('data-product-id');
      const variantID = e.target?.closest('[data-findify-product-card]').getAttribute('data-variant-id');
      const url = e.target?.closest('[data-findify-product-card]').getAttribute('data-product-url');
  
      try {
        Findify.analytics.sendEvent('click-item', {
          rid,
          item_id: itemID,
          variant_item_id: variantID
        })
      } catch (error) {
        console.log('error', error);
      }
  
      navigate(url, e)
  };

  const addSuggestionClickEvent = () => {
      document.querySelectorAll('.findify-autocomplete [data-findify-suggestion]').forEach(i => {
        i.addEventListener("click", (e) => onSuggestionClick(e));
      });
  };

  const addProductCardClickEvent = () => {
      document.querySelectorAll('.findify-autocomplete [data-findify-product-card]').forEach(i => {
        i.addEventListener("click", (e) => onProductCardClick(e));
      });
  };

  const setAutocompletePosition = () => {
      const top = document.querySelector(selector).getBoundingClientRect().bottom + 2;
      document.querySelector('.findify-autocomplete').style.top = `${top}px`;
  };

  const closeAutocomplete = (e, isEscape) => { 
      if (isEscape || !document.querySelector('.findify-autocomplete').className.includes('hidden')) {
        document.querySelector('.findify-autocomplete').className += ' hidden';
      }
  };

  const closeAutocompleteOutside = (e) => { 
    const findifyAutocomplete = document.querySelector('.findify-autocomplete');
    const input = document.querySelector(selector);
      if (!findifyAutocomplete.contains(e.target) && !input.contains(e.target)) {
          closeAutocomplete(e);
          document.removeEventListener("click", closeAutocompleteOutside);
      }
  }

  const openAutocomplete = () => {
      const autocompleteClassName = document.querySelector('.findify-autocomplete').className;
      document.querySelector('.findify-autocomplete').className = autocompleteClassName.replace(' hidden', '');
      document.querySelector('.findify-close-autocomplete')?.addEventListener("click", (e) => closeAutocomplete(e));
      document.addEventListener("click", (e) => closeAutocompleteOutside(e));
      setAutocompletePosition();
  };

  const renderContent = (content) => {
      const cardTemplate = document.querySelector('.content-item').outerHTML;
      const container = document.querySelector('.findify-autocomplete-content .content-container').innerHTML;
      document.querySelector('.findify-autocomplete-content .content-container').innerHTML = '';
  
      content[this.contentID].forEach(
        item => {
          let card = cardTemplate;
          const keys = Object.keys(item);
  
          keys.forEach(
            key => {
              card = card.replace(`{findify_${key}}`, item[key]);
              return card;
            }
          );
  
          document.querySelector('.findify-autocomplete-content .content-container').innerHTML += card;
        }
      )
  };

  const loadFindifyAutocomplete = async (event) => { 
      const hasQueryChanged = !event || event.target.value !== q;
  
      if (hasQueryChanged) {
        q = event ? event.target.value : '';
        event.target.removeEventListener("focus", loadFindifyAutocomplete);
        event.target.removeEventListener("keyup", handleFindifyChange);
        latestResponse = await Findify.utils.api.autocomplete(q);
        rid = latestResponse.meta.rid;
        await Findify.core.render.autocomplete(latestResponse);

        // On open bind events on the elements shown.
        addSuggestionClickEvent();
        addProductCardClickEvent();
        
        //if (this.contentID) this.renderContent(this.#latestResponse.content);
      }
      if (event.type == 'focus') setTimeout(openAutocomplete, 200);
      else openAutocomplete();
  }

  const handleFindifyChange = e => {
    if (e.code == 'Enter') {
      onSearch(e);
    } else if (e.code == 'Escape') {
      closeAutocomplete(e, true);
    } else {
      loadFindifyAutocomplete(e);
    }
  }

  const initializeFindifyAutocomplete = () => {
      const input = document.querySelector(selector);
      input.addEventListener("focus", loadFindifyAutocomplete);
      input.addEventListener("keyup", handleFindifyChange);
  };
  
  const initializeFullscreenAutocomplete = () => {
      if (item_limit && item_limit > 4) document.querySelector('.findify-autocomplete').style.height = '100%'
      initializeFindifyAutocomplete();
  } 
  
  /*
  const initializeDropdownAutocomplete = () => {
      const { left, right } = document.querySelector(selector).getBoundingClientRect();
      if (left + 650 > window.innerWidth) {
          document.querySelector('.findify-autocomplete').style.left = 'initial';
          document.querySelector('.findify-autocomplete').style.right = `${window.innerWidth - right}px`;
          } else {
          document.querySelector('.findify-autocomplete').style.left = `${left}px`;
          };
          initializeFindifyAutocomplete();
  } 

  initializeDropdownAutocomplete();
   */

  initializeFullscreenAutocomplete();  
};