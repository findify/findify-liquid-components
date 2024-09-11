// Script - event binding for findify-tabs.liquid

const initFindifyTabsEvents = () => {
  const selectors = {
    tabContent: ".findify-tab-content",
    tab: ".findify-tab",
    id: (tab_id) => `${tab_id}-content`,
  };

  const getContentData = async (target) => {
    return await findify.contents.api({ [target]: findify.grid.liquid?.contents[target] });
  }

  const renderContents = async (target) => {
    const contentData = await getContentData(target);
    findify.grid.renderContents(contentData, false);
    return contentData[target].meta.total;
  }

  const onTabClick = (event, tab_id) => {
    let i, tabContent, tabs;
    tabContent = document.querySelectorAll(selectors.tabContent);
    for (i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = "none";
    }
    tabs = document.querySelectorAll(selectors.tab);
    for (i = 0; i < tabs.length; i++) {
      tabs[i].className = tabs[i].className.replace(" findify-active", "");
    }
    document.getElementById(selectors.id(tab_id)).style.display = "block";
    event.currentTarget.className += " findify-active";
  };

  const init = () => {
    if (Object.keys(findify.grid.liquid?.contents).length > 0) {
      document.querySelectorAll(".findify-tab").forEach((element) => {
        element.addEventListener("click", (event) => {
          onTabClick(event, element.getAttribute("target")
          )
        }
        );
      });

      Object.keys(findify.grid.liquid?.contents).forEach(content_id => {
        const contentTabEl = document.querySelector(`button[target=${content_id}]`)
        initOneTimeClick(contentTabEl)
      })
    }
  };

  const clickEvent = async (ev) => {
    const target = ev.target.parentElement.getAttribute('target')
    const total = await renderContents(target)
    ev.target.parentElement.removeEventListener('click', clickEvent)
    ev.target.parentElement.querySelector('span').innerText = total
    initFindifyContentEvents()
  }

  const initOneTimeClick = (contentTabEl) => {
    contentTabEl.addEventListener('click', clickEvent)
  }

  init();
};
