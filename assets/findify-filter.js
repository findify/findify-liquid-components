// Script - event binding for findify-filters.liquid

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
  bodyContainer: ".findify-filters--body-container",
  rangeSubmit: ".findify-filters--range-submit",
  rangeSliderWrapper: ".findify-filters--range-slider__wrapper",
  rangeSliderMin: ".findify-filters--range__slider-min",
  rangeSliderMax: ".findify-filters--range__slider-max",
  rangeSliderLowerValue: ".findify-filters--range__slider-current-value-lower",
  rangeSliderUpperValue: ".findify-filters--range__slider-current-value-upper",
  rangeSliderTrack: ".findify-filters--range__slider-track",
  filterHeader: ".findify-filters-header",
  filterHeaderTitle: ".findify-filters-header-title",
  filterContainer: ".findify-filters-container",
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

const toggleFilterDrawer = () =>
  toggleDrawer(
    "open-left",
    true,
    document.querySelector(selectors.filterSection)
  );

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
    const info = filter.getAttribute("info");
    const [name, type] = info.split("|");
    const selected = filter.getAttribute("selected") === "t";

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

const bindListenersToRangeSlider = () => {
  setTimeout(() => {
    const thumbsize = 14;
    const setSliders = (slider, splitvalue) => {
      const min = slider.querySelector(selectors.rangeSliderMin);
      const max = slider.querySelector(selectors.rangeSliderMax);
      const lower = slider.querySelector(selectors.rangeSliderLowerValue);
      const upper = slider.querySelector(selectors.rangeSliderUpperValue);
      const rangewidth = parseInt(slider.getAttribute("data-rangewidth"));
      const rangemin = Math.round(slider.getAttribute("data-rangemin"));
      const rangemax = Math.round(slider.getAttribute("data-rangemax"));

      min.setAttribute("max", splitvalue);
      max.setAttribute("min", splitvalue);

      min.style.width =
        parseInt(
          thumbsize +
            ((splitvalue - rangemin) / (rangemax - rangemin)) *
              (rangewidth - 2 * thumbsize)
        ) + "px";
      max.style.width =
        parseInt(
          thumbsize +
            ((rangemax - splitvalue) / (rangemax - rangemin)) *
              (rangewidth - 2 * thumbsize)
        ) + "px";
      min.style.left = "0px";
      max.style.left = `${parseInt(min.style.width)}px`;

      slider.style.height = `${lower.offsetHeight + min.offsetHeight}px`;

      max.value = max.getAttribute("data-value");
      min.value = min.getAttribute("data-value");
      lower.innerHTML = min.getAttribute("data-value");
      upper.innerHTML = max.getAttribute("data-value");
    };
    const setTrack = (slider, direction) => {
      const min = slider.querySelector(selectors.rangeSliderMin);
      const max = slider.querySelector(selectors.rangeSliderMax);
      const minValue = min.value;
      const maxValue = max.value;
      const minValueMaxRange = parseInt(min.getAttribute("max"));
      const minValueMinRange = parseInt(min.getAttribute("min"));
      const maxValueMaxRange = parseInt(max.getAttribute("max"));
      const maxValueMinRange = parseInt(max.getAttribute("min"));
      const minTotalInputWidth = min.offsetWidth;
      const maxTotalInputWidth = max.offsetWidth;
      const thumbHalfWidth = slider.getAttribute("data-thumbsize") / 2;
      const left =
        ((minValue - minValueMinRange) /
          (minValueMaxRange - minValueMinRange)) *
          (minTotalInputWidth - thumbHalfWidth - thumbHalfWidth) +
        thumbHalfWidth;
      const right =
        ((maxValue - maxValueMinRange) /
          (maxValueMaxRange - maxValueMinRange)) *
          (maxTotalInputWidth - thumbHalfWidth - thumbHalfWidth) +
        thumbHalfWidth +
        minTotalInputWidth;
      const width = right - left;

      switch (direction) {
        case "min":
        case "init":
          slider.parentElement.querySelector(
            selectors.rangeSliderTrack
          ).style.cssText += `
                left: ${left}px; 
                width: ${width}px;
            `;
          break;
        case "max":
          slider.parentElement.querySelector(
            selectors.rangeSliderTrack
          ).style.cssText += `
                width: ${width}px;
            `;
          break;
        default:
          return;
      }
    };

    const update = (el, direction) => {
      const slider = el.parentElement;
      const min = slider.querySelector(selectors.rangeSliderMin);
      const max = slider.querySelector(selectors.rangeSliderMax);
      const minvalue = parseInt(min.value);
      const maxvalue = parseInt(max.value);
      const avgvalue = parseInt((minvalue + maxvalue) / 2);

      min.setAttribute("data-value", minvalue);
      max.setAttribute("data-value", maxvalue);

      setTrack(slider, direction);
      setSliders(slider, avgvalue);
    };

    const init = (slider) => {
      const min = slider.querySelector(selectors.rangeSliderMin);
      const max = slider.querySelector(selectors.rangeSliderMax);
      const minValue = parseInt(min.getAttribute("min"));
      const maxValue = parseInt(max.getAttribute("max"));
      // const rangemin = (filters?.sliderValues?.from && filters?.sliderValues?.from > parseInt(min.getAttribute('min'))) ? filters?.sliderValues?.from : parseInt(min.getAttribute('min'));
      // const rangemax = (filters?.sliderValues?.to && filters?.sliderValues?.to < parseInt(max.getAttribute('max'))) ? filters?.sliderValues?.to : parseInt(max.getAttribute('max'));
      const avgvalue = parseInt((minValue + maxValue) / 2);
      const interactionEvent = findify.utils.isMobile() ? "touchend" : "click";

      const filterName = slider.getAttribute("data-ref");

      // min.setAttribute('data-value', rangemin);
      // max.setAttribute('data-value', rangemax);
      slider.setAttribute("data-rangewidth", slider.offsetWidth);

      setSliders(slider, avgvalue);
      setTrack(slider, "init");

      min.addEventListener("input", (e) => update(min, "min"));
      max.addEventListener("input", (e) => update(max, "max"));
      slider.querySelectorAll("input").forEach((el) => {
        el.addEventListener(interactionEvent, () => {
          const from = parseInt(min.value);
          const to = parseInt(max.value);

          let value;
          if (from && to) {
            value = `from|${from}-to|${to}`;
          } else if (from && !to) {
            value = `from|${from}`;
          } else if (to && !from) {
            value = `to|${to}`;
          }
          findify.filters.update({ value, type: "range", name: filterName });
          findify.grid.load();
        });
      });
    };
    // observe width change to properly init slider on mob, on desktop works as well
    const slider = document.querySelector(selectors.rangeSliderWrapper);
    const resizeObserver = new ResizeObserver(() => init(slider));
    resizeObserver.observe(slider);
  }, 350);
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

const handleExpandSpecificFilter = () => {
  const hideFilter = (filterContainer) => {
    filterContainer.setAttribute("aria-collapsed", "true");
  };

  const showFilter = (filterContainer) => {
    filterContainer.setAttribute("aria-collapsed", "false");
  };

  const assignListenerToFilterHeader = (filterContainer, btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (filterContainer.getAttribute("aria-collapsed") === "false") {
        hideFilter(filterContainer);
      } else {
        showFilter(filterContainer);
      }
    });
  };

  document.querySelectorAll(selectors.filterHeader).forEach((btn) => {
    const filterName = btn.getAttribute("ref");
    const filterContainer = document.querySelector(
      `[aria-label='${filterName}']`
    );

    assignListenerToFilterHeader(filterContainer, btn);
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
  //bindListenersToRangeSlider();
  bindClickEvent();
  handleExpandSpecificFilter();
  handleFiltersSearch();

  initFindifyMobileFiltersEvents();
  initFindifyDesktopFiltersEvents();
};
