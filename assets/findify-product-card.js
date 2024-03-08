const getMetaByWidgetType = (widgetType) => {
  if (widgetType === "search") {
    return findify.grid.state.meta;
  }
  if (widgetType === "autocomplete") {
    return findify.autocomplete.state.meta;
  }
  if (widgetType.includes("findify-rec")) {
    return findify.recommendation.state[widgetType]?.response?.meta;
  }
  throw new Error(`there is no meta for widget type : ${widgetType}`);
};

const initProductCardAnalytics = (id, properties) => {
  const meta = getMetaByWidgetType(properties.widgetType);

  try {
    findify.core.analytics?.sendEvent("click-item", {
      rid: meta.rid,
      item_id: id,
      variant_item_id: properties.variantId,
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

const onProductCardClick = (e) => {
  const target = e.currentTarget;
  const widgetType = target.getAttribute("findify-widget-type");
  const { rid } = getMeta(widgetType);
  const item_id = e.target
    ?.closest("[data-product-id]")
    .getAttribute("data-product-id");
  const variant_item_id = e.target
    ?.closest("[data-variant-id]")
    .getAttribute("data-variant-id");

  try {
    findify.core.analytics?.sendEvent("click-item", {
      rid,
      item_id,
      variant_item_id,
    });
  } catch (error) {
    console.log("error", error);
  }
};
