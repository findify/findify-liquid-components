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
