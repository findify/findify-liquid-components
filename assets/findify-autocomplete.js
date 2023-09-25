const initAutocomplete = () => {
    const isMobile = window.innerWidth < 768;
    let selector = "input[name='q']";
    let rid, q, item_limit;
    
    if(Findify && Findify.state && Findify.state.autocomplete && Findify.state.autocomplete.meta) {
        let meta =  Findify?.state?.autocomplete?.meta;
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
        const target = e.target;
        const selectors = selector.split(',');
        const checkIsActiveSelector = (i) => document.querySelector(selector).matches(i)
          || document.querySelector(selector).className.includes(i.replace('.', ''))
    
        const isInputActive = selectors.find(i => checkIsActiveSelector(i))?.length > 0;
    
        if (isEscape ||
          (target.closest('.findify-close-autocomplete') || isInputActive == false)
          && document.querySelector('.findify-autocomplete').className.includes('hidden') == false
        ) {
          document.querySelector('.findify-autocomplete').className += ' hidden';
        }
    };
  
    const openAutocomplete = () => {
        const autocompleteClassName = document.querySelector('.findify-autocomplete').className;
        document.querySelector('.findify-autocomplete').className = autocompleteClassName.replace(' hidden', '');
        document.querySelector('.findify-close-autocomplete')?.addEventListener("click", (e) => closeAutocomplete(e));
        setTitle();
    };
  
    const onScrollListener = () => {
        document.addEventListener('scroll', () => {
          if (document.querySelector('.findify-autocomplete').className.includes('hidden') == false)
            setAutocompletePosition();
        })
    };
  
    const setViewAll = () => {
        const viewAll = document.querySelector('.findify-view-all')?.href;
        const q = document.querySelector(selector).value;
        document.querySelectorAll('.findify-view-all').forEach(i => {
          i.href = `${viewAll}${q}`;
          if (q) { 
              if (isMobile) i.classList.add('findify-view-all-with-query');
              i.textContent = 'View all results for';
              i.innerHTML += `<span class="findify-components-autocomplete--tip__highlight">"${q}"</span>`;
          } else {
            i.textContent = 'View all';
          }
        })
    };
  
    const setTitle = () => {
      const q = document.querySelector(selector).value;
      const suggestions = document.querySelector('.suggestions-wrapper h3');
      const products = document.querySelector('.products-wrapper h3');
      
      if (q) {
        suggestions.textContent = 'Search suggestions';
        products.textContent = 'Product matches';
      } else {
        suggestions.textContent = 'Trending searches';
        products.textContent = 'Trending products';
      }
      return;
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
          latestResponse = await Findify.utils.api.autocomplete(q);
          await Findify.core.render.autocomplete(latestResponse);
  
          rid = latestResponse.meta.rid;
    
          setViewAll();
          onScrollListener();
          // On open bind events on the elements shown.
          addSuggestionClickEvent();
          addProductCardClickEvent();
          //if (this.contentID) this.renderContent(this.#latestResponse.content);
        }
    
        if (event) { // Interaction with selector has happen. Open autocomplete.
            openAutocomplete();
            setAutocompletePosition(); 
        }
    }
  
    const initializeFindifyAutocomplete = () => {
        let submitting = false;
        let timer;
    
        const selectors = selector.split(',');
        selectors.forEach(
          selector => {
            document.querySelectorAll(selector).forEach(i => {
              i.addEventListener("focus", (e) => {
                loadFindifyAutocomplete(e)
              })
    
              i.addEventListener("keyup", (e) => {
                if (e.code == 'Enter') {
                  if (!submitting) {
                    submitting = true;
                    onSearch(e);
                  }
                } else if (e.code == 'Escape') {
                  closeAutocomplete(e, true);
                } else {
                  clearTimeout(timer);
                  timer = setTimeout(() => { loadFindifyAutocomplete(e) }, 300);
                }
              });
            });
          }
        )
    
        addEventListener("submit", (e) => {
          if (!submitting && e.srcElement.action.includes('search')) {
            submitting = true;
            onSearch(e);
          }
        });
        document.querySelector('body').addEventListener("click", (e) => closeAutocomplete(e))
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
  }
  
  setTimeout(() => initAutocomplete(), 500); // wait for findify to load