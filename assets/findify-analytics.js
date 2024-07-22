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
    const itemId = document
      .getElementById(productPageAnalyticsTagSelectorId)
      ?.getAttribute('data-findify-item-id');
    const variantId = document
      .getElementById(productPageAnalyticsTagSelectorId)
      ?.getAttribute('data-findify-variant-item-id');

    const sendEvent = (...props) =>
      findify.core.analytics.sendEvent('view-page', ...props);

    try {
      sendEvent({
        width,
        height,
        ref,
        url,
        page_type,
        item_id: itemId,
        variant_item_id: variantId,
      });
    } catch (error) {
      console.error('Error sending view-page event', error);
    }
  };

  const updateCartEvent = () => {
    const cart = document.querySelector('[data-findify-event="update-cart"]');
    const cartItems = cart && Array.prototype.slice.call(cart.children);
    const items =
      cartItems.map((item) => {
        return {
          item_id: item.getAttribute('data-findify-item-id'),
          variant_item_id: item.getAttribute('data-findify-variant-item-id'),
          unit_price: item.getAttribute('data-findify-unit-price'),
          quantity: item.getAttribute('data-findify-quantity'),
        };
      }) || [];

    try {
      findify.core.analytics.sendEvent('update-cart', { line_items: items });
    } catch (error) {
      console.error('Error sending update-cart event', error);
    }
  };

  findify.core.init.then(() => {
    viewPageEvent();
    updateCartEvent();
  });
})();
