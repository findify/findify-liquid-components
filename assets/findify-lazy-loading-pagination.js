
const initFindifyLazyLoadingPagination = (
  lazy_loading_pagination_threshold
) => {
  let lazyLoadedCounter = 0;

  const selectors = {
    prevBtn: "findify-pagination-load-previous",
    nextBtn: "findify-pagination-load-more",
    loader: "findify-grid-infinite-scroll",
    grid: "findify-product-grid",
    paginationContainer: "findify-lazy-loading-pagination-container"
  };

  const initialPage = findify.pagination.state.page;

  const renderPage = async (page) => {
    findify.pagination.setState({
      ...findify.pagination.state,
      offset: (page - 1) * findify.pagination.state.limit,
      page: page,
    });
    const response = await findify.grid.api();
    return await findify.grid.renderGridItemsHTML(
      response.items,
      response.promoSpots
    );
  };

  const initPrevButton = () => {
    const prevBtnElement = document.getElementById(selectors.prevBtn);
    if (prevBtnElement) {
      prevBtnElement.addEventListener("click", async () => {
        const prevPage =
          Math.min(initialPage, findify.pagination.state.page) - 1;
        const items = await renderPage(prevPage);
        const target = document.getElementById(selectors.grid);
        const pageClassName = `page-${prevPage}`;
        items.reverse().forEach((item) => {
          item.classList.add(pageClassName);
          target.prepend(item);
        });
        runProductScripts(pageClassName);
        if (prevPage == 1) {
          prevBtnElement.remove();
        }
      });
    }
  };

  const scrollEventOptions = { passive: true };
  let isLoading = false;
  const onScrollFunction = async () => {
    const nextLoadingElement = document.getElementById(selectors.loader);
    if (!isLoading && findify.utils.isInViewport(nextLoadingElement)) {
      isLoading = true;
      lazyLoadedCounter++;
      await loadNext();
      isLoading = false;
      if (lazyLoadedCounter >= lazy_loading_pagination_threshold) {
        removeLoader(true);
      }
    }
  };

  const removeLoader = (showLoadMoreButton) => {
    window.removeEventListener("scroll", onScrollFunction, scrollEventOptions);
    const nextLoadingElement = document.getElementById(selectors.loader);
    if (nextLoadingElement) {
      nextLoadingElement.remove();
    }
    if (showLoadMoreButton) {
      const nextBtnElement = document.getElementById(selectors.nextBtn);
      nextBtnElement.classList.toggle("hidden");
    }
  };

  const loadNext = async () => {
    const nextPage = Math.max(initialPage, findify.pagination.state.page) + 1;
    const lastPage = Math.ceil(
      findify.grid.state.meta.total / findify.pagination.state.limit
    );
    const items = await renderPage(nextPage);
    const target = document.getElementById(selectors.grid);
    const pageClassName = `page-${nextPage}`;
    items.forEach((item) => {
      item.classList.add(pageClassName);
      target.append(item);
    });
    runProductScripts(pageClassName);
    if (nextPage == lastPage) {
      const nextBtnElement = document.getElementById(selectors.nextBtn);
      nextBtnElement.remove();
      removeLoader();
    }
  };

  const initNextEvents = () => {
    const nextLoadingElement = document.getElementById(selectors.loader);
    if (nextLoadingElement) {
      window.addEventListener("scroll", onScrollFunction, scrollEventOptions);
    }
    const nextBtnElement = document.getElementById(selectors.nextBtn);
    if (nextBtnElement) {
      nextBtnElement.addEventListener("click", () => loadNext());
    }
  };

  /**
   * When new page is rendered, the new items might have scripts in it that must manually executed.
   */
  const runProductScripts = (pageClassName) => {
    const productCardScripts = document.querySelectorAll(
      `.${pageClassName} script`
    );
    findify.utils.executeScripts(productCardScripts);
  };

  const scrollToProduct = () => {
    const productData = sessionStorage.getItem("product");
    if (!productData) return;

    const id = productData.split(":")[1];


    const product = document.body.querySelector(
      `#findify-product-grid>div[product-id=product-${id}]`
    );
    const { top, height } = product.getBoundingClientRect();

    const loader = document.getElementById(selectors.loader);
    const paginationContainer = document.querySelector(
      `#findify-pagination > .${selectors.paginationContainer}`
    );

    removeLoader();

    window.scrollTo({
      top: top + window.scrollY - height,
      behavior: "smooth",
    });
    paginationContainer.parentElement.insertBefore(
      loader,
      paginationContainer
    );
    setTimeout(() => {
      sessionStorage.removeItem("product");
      initNextEvents();
    }, 500);

  };

  const init = () => {
    initPrevButton();
    initNextEvents();
    scrollToProduct();
  };
  init();
};
