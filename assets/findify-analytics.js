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

const getMeta = (card) => {
  const recId = card.classList.contains("swiper-slide")
    ? card.parentNode.parentNode.id
    : null;

  if (recId) {
    return Findify?.state?.recommendations[recId]?.data?.meta;
  }
  const isSearchProd = document.querySelector("#findify-search").contains(card);

  if (isSearchProd) {
    return Findify?.state?.search?.meta;
  }
  const isAutoProd = document
    .querySelector("#findify-autocomplete")
    .contains(card);

  if (isAutoProd) {
    return Findify?.state?.autocomplete?.meta;
  }
};

const onProductCardClick = (e) => {
  const target = e.currentTarget;
  const meta = getMeta(target);
  const rid = meta.rid;
  const item_id = e.target
    ?.closest("[data-product-id]")
    .getAttribute("data-product-id");
  const variant_item_id = e.target
    ?.closest("[data-variant-id]")
    .getAttribute("data-variant-id");
  const url = e.target
    ?.closest("[data-findify-product-card]")
    .getAttribute("data-product-url");

  try {
    Findify.analytics?.sendEvent("click-item", {
      rid,
      item_id,
      variant_item_id,
    });
    navigate(url, e);
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
