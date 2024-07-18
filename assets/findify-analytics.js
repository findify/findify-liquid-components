(() => {
  /**
   * productPageAnalyticsTagSelectorId can be found in findify-head-injector
   */
  const productPageAnalyticsTagSelectorId = 'findify-analytics-product';
  const isProductDetails = () =>
    !!document.getElementById(productPageAnalyticsTagSelectorId);

  const getPageType = () => {
    if (isProductDetails()) return 'product-details';
    if (findify.utils.isSearch()) return 'search-results';
    if (findify.utils.isCollection()) return 'smart-collection';
  };

  const viewPageEvent = () => {
    const width = window.screen.width;
    const height = window.screen.height;
    const ref = window.document.referrer;
    const url = window.location.href;
    const page_type = getPageType();

    try {
      findify.core.analytics.sendEvent('view-page', {
        width,
        height,
        ref,
        url,
        page_type,
      });
    } catch (error) {
      console.error('Error sending view-page event', error);
    }
  };

  const updateCartEvent = () => {};

  findify.core.init.then(() => {
    viewPageEvent();
    updateCartEvent();
  });
})();
