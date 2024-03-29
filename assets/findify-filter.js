let selectors = {
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
  rangeSubmit: ".findify-filters--range-submit",
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

const initFindifyDesktopFiltersEvents = () => {
  const domRefs = {
    toggleSection: selectors.toggleFilterSection,
    section: selectors.filterSection,
    openDirection: "open",
  };

  bindToggleEvent(false, domRefs);
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
  bindRangeEvent();

  initFindifyMobileFiltersEvents();
  initFindifyDesktopFiltersEvents();
};
