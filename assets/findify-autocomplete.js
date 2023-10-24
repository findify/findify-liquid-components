// Note: Functions : autocompleteAnalytics and navigate are part of Assets => findify-analytics.js file

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

  const onSearch = (e) => {
      preventDefaults(e);
      const query = document.querySelector(selector).value;
      navigate(`/search?q=${query}`, e, query);
  };

  const getBottom = (el) => {
      const { bottom } = el.getBoundingClientRect();
      return bottom;
  };

  const setAutocompletePosition = (input) => {
      const top = getBottom(input) + 2;
      document.querySelector('.findify-autocomplete').style.top = `${top}px`;
  };

  const closeAutocomplete = (e, isEscape) => { 
      if (isEscape || !document.querySelector('.findify-autocomplete').className.includes('hidden')) {
        document.querySelector('.findify-autocomplete').className += ' hidden';
      }
  };

  const closeAutocompleteOutside = (e, input) => { 
    const findifyAutocomplete = document.querySelector('.findify-autocomplete');
      if (!findifyAutocomplete.contains(e.target) && !input.contains(e.target)) {
          closeAutocomplete(e);
          document.removeEventListener("click", closeAutocompleteOutside);
      }
  }

  const openAutocomplete = (input) => {
      const autocompleteClassName = document.querySelector('.findify-autocomplete').className;
      document.querySelector('.findify-autocomplete').className = autocompleteClassName.replace(' hidden', '');
      document.querySelector('.findify-close-autocomplete')?.addEventListener("click", (e) => closeAutocomplete(e));
      document.addEventListener("click", (e) => closeAutocompleteOutside(e, input));
      setAutocompletePosition(input);
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

        autocompleteAnalytics(event)
        
        //if (this.contentID) this.renderContent(this.#latestResponse.content);
      }
      if (event.type == 'focus') setTimeout(() => openAutocomplete(event.target), 200);
      else openAutocomplete(event.target);
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
    const inputDomRefs = document.querySelectorAll(selector);
    inputDomRefs.forEach(input => {
      input.addEventListener("focus", loadFindifyAutocomplete);
      input.addEventListener("keyup", handleFindifyChange);
    })
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