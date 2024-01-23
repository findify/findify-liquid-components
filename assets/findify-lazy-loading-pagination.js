const initFindifyLazyLoadingPagination = (
  lazy_loading_pagination_threshold
) => {
  let lazyLoadedCounter = 0;

  const selectors = {
    prevBtn: "findify-pagination-load-previous",
    nextBtn: "findify-pagination-load-more",
    loader: "findify-grid-infinite-scroll",
    grid: "findify-product-grid",
  };

  const initialPage = findify.pagination.state.page;

  const renderPage = async (page) => {
    findify.pagination.setState({
      ...findify.pagination.state,
      offset: (page - 1) * findify.pagination.state.limit,
      page: page,
    });
    findify.core.updateUrlParams();
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
        productCardAnalytics("#findify-product-grid", pageClassName);
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
    productCardAnalytics("#findify-product-grid", pageClassName);
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

  const init = () => {
    initPrevButton();
    initNextEvents();
  };
  init();
};
