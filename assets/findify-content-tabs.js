// Script - event binding for findify-tabs.liquid

const initFindifyTabsEvents = () => {
  const selectors = {
    tabContent: ".findify-tab-content",
    tab: ".findify-tab",
    id: (tab_id) => `${tab_id}-content`,
  };

  const onTabClick = (event, tab_id) => {
    let i, tabContent, tabs;
    tabContent = document.querySelectorAll(selectors.tabContent);
    for (i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = "none";
    }
    tabs = document.querySelectorAll(selectors.tab);
    for (i = 0; i < tabs.length; i++) {
      tabs[i].className = tabs[i].className.replace(" active", "");
    }
    document.getElementById(selectors.id(tab_id)).style.display = "block";
    event.currentTarget.className += " active";
  };

  const init = () => {
    if (Object.keys(window.FindifyMerchantConfig.features.content).length > 0) {
      document.querySelectorAll(".findify-tab").forEach((element) => {
        element.addEventListener("click", (event) =>
          onTabClick(event, element.getAttribute("target"))
        );
      });
    }
  };
  init();
};
