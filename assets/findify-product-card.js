const getMetaByWidgetType = (widget) => {
  if (widget === "search") {
    return findify.grid.state.meta;
  }
  if (widget === "autocomplete") {
    return findify.autocomplete.state.meta;
  }
  if (widget.includes("findify-rec")) {
    return findify.recommendation.state[widget]?.response?.meta;
  }
  throw new Error(`there is no meta for widget type : ${widget}`);
};

const initProductCardAnalytics = (id, properties) => {
  const meta = getMetaByWidgetType(properties.widget);

  try {
    findify.core.analytics?.sendEvent("click-item", {
      rid: meta.rid,
      item_id: id,
      variant_item_id: properties.selected_variant_id,
    });
  } catch (error) {
    console.log("error", error);
  }
};

const initOnProductCardClick = (id, properties) => {
  document.getElementById(id).addEventListener("click", (e) => {
    initProductCardAnalytics(id, properties);
  });
};

const cleanActiveSwatches = (productCard) => {
  productCard.querySelectorAll('.findify-color-swatch').forEach((swatch) => 
   swatch.classList.remove('active'));
}

const setProductUrl = (productCard, url) => {
  productCard.querySelectorAll('.findify-product-link').forEach((aTag) =>
    aTag.setAttribute("href", url)
  );
}

const onSwatchClick = (event, product_url, variant_url, variant_image) => {
  
  const targetedSwatch = event.target;
  const productCard = targetedSwatch.closest('div[id].findify-product-card');
  const swatchImage = productCard.querySelector(`.findify-product-swatch-image`);
  
  if(targetedSwatch.classList.contains('active')) {

    cleanActiveSwatches(productCard);
    setProductUrl(productCard, product_url);
    swatchImage.setAttribute('hidden', true);
  }
  else {
    cleanActiveSwatches(productCard);
    targetedSwatch.classList.add('active');
    
    setProductUrl(productCard, variant_url);
    swatchImage.removeAttribute('hidden');
    swatchImage.src = `//cdn.shopify.com/s/files/${variant_image}`;
  }
}
