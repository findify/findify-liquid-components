const navigate = (url, e, query, rid) => {
  const openInNewWindow = e && (e.ctrlKey || e.metaKey);
  const redirections = findify.core.merchantConfig.redirections;
  const redirectionURL =
    redirections && redirections[query] ? redirections[query] : url;

  if (redirections && redirections[query]) redirectionFeedback(query, rid);
  if (!window) return;
  if (openInNewWindow) return window.open(redirectionURL, "_blank");
  return (window.location.href = redirectionURL);
};

const redirectionFeedback = async (query, rid) => {
  try {
    findify.core.analytics.sendEvent("redirect", {
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
  const { q: query, rid } = findify.autocomplete.state.meta;
  const suggestion = e.target?.innerText;
  try {
    findify.core.analytics.sendEvent("click-suggestion", {
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

const productCardAnalytics = (containerId, extraClass) => {
  let selector = containerId
    ? `${containerId} .findify-product-card`
    : ".findify-product-card";
  if (extraClass) {
    selector += `.${extraClass}`;
  }
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
  productCardAnalytics("#findify-autocomplete");
  suggestionAnalytics();
};

// Temporary location! MoreSize button for swatches
window.onload = function () {
  setTimeout(function () {
    const moreButtons = document.querySelectorAll(".sizeButton");
    const arrayNodes = Array.prototype.slice.call(moreButtons);
    arrayNodes.map((button) => {
      button.addEventListener("click", (e) => {
        const currentButton = e.target;
        const parent = currentButton.parentNode;
        const currentSwatchContainer =
          currentButton.parentNode.parentNode.parentNode;
        parent.style.flexWrap = "wrap";

        console.log({ sadfs: currentSwatchContainer.style });
        const hidedSwatches = parent.querySelectorAll('[hidedswatch="true"]');
        Array.from(hidedSwatches).map((node) =>
          node.classList.remove("hided-swatch-option")
        );
        currentButton.classList.add("hided-swatch-option");
      });
    });
  }, 1000);
};
