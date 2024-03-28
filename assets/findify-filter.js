let selectors = {
  filtersContainer: "#findify-filters",
  filterSection: "#findify-filters-sidebar",
  toggleFilterSection: "#findify-toggle-filter",
  selectedItem: ".findify-filters-checkbox-item-value-selected",
  breadCrumbsContainer: ".findify-search-desktop-breadcrumb",
  breadcrumbItemClass: ".findify-filters-breadcrumb-item",
  clearAll: ".findify-filters-breadcrumbs-clear-all",
  showMoreBreadcrumbs: ".findify-filters-breadcrumbs-show-more",
  checkboxItem: ".findify-filters-checkbox-item",
  checkBoxNestedValue: ".findify-filters--checkbox-nested-value",
  checkBoxValue: ".findify-filters-checkbox-item-value",
  bodyWrapper: ".findify-filters--body-wrapper",
  bodyContainer: ".findify-filters-body",
  rangeSubmit: ".findify-filters--range-submit",
  filterHeader: ".findify-filters-header",
  filtersSearchInput: ".findify-filters--checkbox-search input",
  filtersWrapper: ".findify-filters-wrapper",
  modalFilterToggler: "#findify-modal-toggler",
  mobileModalWrapper: ".findify-filters-mobile-modal",
  mobileHeader: "#findify-modal-filters-header",
  mobileSeeResults: "#findify-modal-filters-footer",
  buttonCustomPriceRange: "#findify-custom-price-range",
  inputPriceRangeMax: "#findify-price-range-max",
  inputPriceRangeMin: "#findify-price-range-min",
};

const toggleFilterDrawer = () => {
  const filterSection = document.querySelector(selectors.filterSection);
  filterSection && toggleDrawer("open-left", true, filterSection);
};

const priceRangeUpdater = (inputMax, inputMin) => {
  if (!inputMax.value && !inputMin.value) return;
  toggleFilterDrawer();
  findify.filters.update({
    value: `from|${inputMin.value}-to|${inputMax.value}`,
    type: "range",
    name: "price",
  });
  findify.grid.load();
};

const priceRangeEventHandler = () => {
  const priceRangeButton = document.querySelector(
    selectors.buttonCustomPriceRange
  );
  const inputMax = document.querySelector(selectors.inputPriceRangeMax);
  const inputMin = document.querySelector(selectors.inputPriceRangeMin);

  inputMax?.addEventListener("keyup", (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      priceRangeUpdater(inputMax, inputMin);
    }
  });
  inputMin?.addEventListener("keyup", (e) => {
    if (e.key === "Enter" || e.keyCode === 13) {
      priceRangeUpdater(inputMax, inputMin);
    }
  });

  priceRangeButton?.addEventListener("click", () =>
    priceRangeUpdater(inputMax, inputMin)
  );
};

const bindClickEvent = () => {
  const filters = [...document.querySelectorAll(selectors.checkboxItem)];
  filters.forEach((filter) => {
    let value = filter.getAttribute("value").trim();
    const name = filter.getAttribute("data-name");
    const type = filter.getAttribute("data-type");
    const selected = filter.getAttribute("selected");

    filter.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFilterDrawer();
      findify.filters.update({ value, type, name });
      findify.grid.load();
    });
  });
  priceRangeEventHandler();
};

const bindBreadcrumbClickEvent = () => {
  const breadcrumbs = [
    ...document.querySelectorAll(selectors.breadcrumbItemClass),
  ];
  const clearAllCrumbs = document.querySelectorAll(selectors.clearAll);

  if (breadcrumbs.length) {
    clearAllCrumbs.forEach((clearAll) => {
      clearAll.addEventListener("click", () => {
        toggleFilterDrawer();
        findify.filters.setState([]);
        findify.grid.load();
      });
    });
  }

  breadcrumbs.forEach((breadcrumb) => {
    const name = breadcrumb.getAttribute("name");
    const type = breadcrumb.getAttribute("type");
    const value = breadcrumb.getAttribute("value");

    breadcrumb.addEventListener("click", () => {
      findify.filters.update({ name, type, value });
      findify.grid.load();
    });
  });
};

const initBreadcrumbShowMore = () => {
  const showMore = document.querySelector(selectors.showMoreBreadcrumbs);
  const breadcrumbsContainer = document.querySelector(
    `.desktop ${selectors.breadCrumbsContainer}`
  );
  if (breadcrumbsContainer) {
    const breadcrumbs = [
      ...breadcrumbsContainer.querySelectorAll(selectors.breadcrumbItemClass),
    ];
    const gap = 15;
    const showMoreWidth = showMore.offsetWidth;
    const clearAllWidth = document.querySelector(
      selectors.clearAll
    ).offsetWidth;
    let totalCount = 0;
    let hiddenCount = 0;
    let totalBreadcrumbsWidth = 0;
    let containerWidth = breadcrumbsContainer.offsetWidth;
    let hiddenBreadcrumbs = [];

    // start with show more width
    totalBreadcrumbsWidth += showMoreWidth + clearAllWidth;

    // iterate over breadcrumbs and add their width to total width
    breadcrumbs.forEach((breadcrumb) => {
      totalBreadcrumbsWidth += breadcrumb.offsetWidth + gap;
      totalCount += 1;
      if (totalBreadcrumbsWidth > containerWidth) {
        hiddenCount += 1;
        breadcrumb.setAttribute("style", "display: none;");
        hiddenBreadcrumbs.push(breadcrumb);
      }
    });

    // if there are hidden breadcrumbs, display show more button and add event listener
    if (hiddenCount > 0) {
      const showMoreTextContainer = showMore.querySelector("small");
      showMoreTextContainer.innerHTML = `${hiddenCount} more`;
      showMore.addEventListener("click", () => {
        showMore.classList.toggle("open");
        hiddenBreadcrumbs.forEach((breadcrumb) => {
          if (breadcrumb.hasAttribute("style")) {
            breadcrumb.removeAttribute("style");
            showMoreTextContainer.innerHTML = "Less";
          } else {
            breadcrumb.setAttribute("style", "display: none;");
            showMoreTextContainer.innerHTML = `${hiddenCount} more`;
          }
        });
      });
    } else {
      showMore.style.display = "none";
    }
  }
};

const bindRangeEvent = () => {
  const rangeInputEvent = (currentInput, otherInput, button, field) => {
    const disableSubmit = () => button.setAttribute("disabled", true);

    let from, to;
    if (field === "from") {
      from = currentInput.value;
      to = otherInput.value;
    } else {
      from = otherInput.value;
      to = currentInput.value;
    }

    let min = currentInput.getAttribute("min");
    let max = currentInput.getAttribute("max");

    if (from && (from < min || from > max)) {
      // disableSubmit()
    } else if (to && (to > max || to < min)) {
      // disableSubmit();
    } else if (!from && !to) {
      disableSubmit();
    } else {
      button.removeAttribute("disabled");
    }
  };

  const submitButtons = [...document.querySelectorAll(selectors.rangeSubmit)];
  submitButtons.forEach((submitButton) => {
    const name = submitButton.getAttribute("ref");
    const filterContainer = document.querySelector(`[aria-label='${name}']`);
    const inputFrom = filterContainer.querySelector("input[aria-owns=from]");
    const inputTo = filterContainer.querySelector("input[aria-owns=to]");

    inputFrom.addEventListener("input", (e) =>
      rangeInputEvent(e.target, inputTo, submitButton, "from")
    );
    inputTo.addEventListener("input", (e) =>
      rangeInputEvent(e.target, inputFrom, submitButton, "to")
    );

    submitButton?.addEventListener("click", (e) => {
      e.preventDefault();
      const from = inputFrom.value;
      const to = inputTo.value;

      let value;
      if (from && to) {
        value = `from|${from}-to|${to}`;
      } else if (from && !to) {
        value = `from|${from}`;
      } else if (to && !from) {
        value = `to|${to}`;
      }
      findify.filters.update({ value, type: "range", name });
      findify.grid.load();
    });
  });
};

const handleFiltersSearch = () => {
  document.querySelectorAll(selectors.filtersSearchInput).forEach((input) => {
    const filterName = input.getAttribute("ref");
    const filterContainer = document.querySelector(
      `[aria-label='${filterName}']`
    );
    const filterWrapper = filterContainer.querySelector(selectors.bodyWrapper);
    const items = [...filterWrapper.querySelectorAll(selectors.checkboxItem)];

    input.addEventListener("input", (e) => {
      const value = e.target.value.toLowerCase();
      items.forEach((i) => {
        const text = i.innerText.toLowerCase();
        if (!text.includes(value)) {
          i.setAttribute("aria-hidden", "true");
        } else {
          if (i.getAttribute("aria-hidden") === "true" || value === "") {
            i.setAttribute("aria-hidden", "false");
          }
        }
      });
    });
  });
};

const initFindifyDesktopFiltersEvents = () => {
  const domRefs = {
    toggleSection: selectors.toggleFilterSection,
    section: selectors.filterSection,
    openDirection: "open",
  };

  bindToggleEvent(false, domRefs);
  initBreadcrumbShowMore();
};

const initFindifyMobileFiltersEvents = () => {
  const domRefs = {
    toggleSection: selectors.modalFilterToggler,
    section: selectors.filterSection,
    drawerHeader: selectors.mobileHeader,
    drawerSeeResults: selectors.mobileSeeResults,
    openDirection: "open-left",
  };

  const classNames = ["findify-modal", "animated-left", "left"];

  bindToggleEvent(true, domRefs, classNames);
};

const initFindifyFiltersEvents = () => {
  bindBreadcrumbClickEvent();
  bindRangeEvent();
  bindClickEvent();
  handleFiltersSearch();

  initFindifyMobileFiltersEvents();
  initFindifyDesktopFiltersEvents();
};
