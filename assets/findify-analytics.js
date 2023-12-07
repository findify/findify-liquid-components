const navigate = (url, e, query, rid) => {
  const openInNewWindow = e && (e.ctrlKey || e.metaKey);
  const redirections = Findify?.merchantConfig?.redirections;
  const redirectionURL =
    redirections && redirections[query] ? redirections[query] : url;

  if (redirections && redirections[query]) redirectionFeedback(query, rid);
  if (!window) return;
  if (openInNewWindow) return window.open(redirectionURL, "_blank");
  return (window.location.href = redirectionURL);
};

const redirectionFeedback = async (query, rid) => {
  try {
    Findify.analytics.sendEvent("redirect", {
      rid,
      suggestion: query,
    });
  } catch (error) {
    console.log("error", error);
  }
};

const onSuggestionClick = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  const { q: query, rid } = Findify?.state?.autocomplete?.meta;
  const suggestion = e.target?.innerText;
  try {
    Findify.analytics.sendEvent("click-suggestion", {
      rid,
      suggestion: suggestion,
    });
  } catch (error) {
    console.log("error", error);
  }
  return navigate(e.target.href, e, query, rid);
};

const getMeta = (widgetType) => {
  if (widgetType === "search") {
    return Findify?.state?.search?.meta;
  }
  if (widgetType === "autocomplete") {
    return Findify?.state?.autocomplete?.meta;
  }
  if (widgetType.includes("findify-rec")) {
    return Findify?.state?.recommendations[widgetType]?.data?.meta;
  }
  throw new Error(`there is no meta for widget type : ${widgetType}`);
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
    Findify.analytics?.sendEvent("click-item", {
      rid,
      item_id,
      variant_item_id,
    });
  } catch (error) {
    console.log("error", error);
  }
};

const productCardAnalytics = (e) => {
  const selector = e
    ? "#findify-autocomplete .findify-product-card"
    : ".findify-product-card";
  document.querySelectorAll(selector).forEach((card) => {
    card.addEventListener("click", (e) => onProductCardClick(e));
  });
};

const suggestionAnalytics = () => {
  document
    .querySelectorAll(".findify-autocomplete [data-findify-suggestion]")
    .forEach((i) => {
      i.addEventListener("click", (e) => onSuggestionClick(e));
    });
};

const autocompleteAnalytics = (e) => {
  productCardAnalytics(e);
  suggestionAnalytics();
};
