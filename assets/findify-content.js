/*
 *   Description: Bind infinite scroll event on window, and checking the div with id if shown and active and reached
 *   @return void;
 */
const initFindifyContentEvents = () => {
  const contentIntegrations = Object.keys(findify.grid.liquid?.contents).map((id) => ({
    id,
  }));

  const updateActivePage = async (page, content_id) => {
    const contentSelector = `#${content_id}-content`;
    const offset = (page - 1) * findify.contents.state[content_id].meta.limit;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const contentToLoad = {
      [content_id]: {
        title: findify.grid.liquid?.contents[content_id].title,
      },
    };

    const response = await findify.contents.api(
      contentToLoad,
      {
        offset,
        limit: findify.contents.state[content_id].meta.limit,
      },
      true
    );

    await findify.pagination.render(
      response[content_id]?.meta,
      `#${content_id}-content`
    );
    // findify.utils.executeElementScripts(
    //   document.querySelector(`#${id}-content #findify-pagination`)
    // );

    await findify.grid.renderContents(
      {
        [content_id]: {
          ...response[content_id],
          items: [...response[content_id].items],
        },
      },
      false,
      true
    );
  };

  contentIntegrations.forEach(({ id }) => {
    if (findify.contents?.state && findify.contents?.state[id]) {

    const infiniteScrollElement = document.getElementById(
      `${id}-infinite-scroll`
    );

    /*
     *   @return boolean;
     */
    const isContentDisplayed = () => {
      return document.getElementById(`${id}-content`).style.display === "block";
    };

    const hasNextPage = (currentPage, lastPage) => currentPage <= lastPage;

    const scrollEventOptions = { passive: true };

    const onScrollFunction = async () => {
      const currentPage =
        findify.contents.state[id].meta.offset /
          findify.contents.state[id].meta.limit +
        1;
      const lastPage = Math.ceil(
        findify.contents.state[id].meta.total /
          findify.contents.state[id].meta.limit
      );
      if (
        isContentDisplayed() &&
        !findify.contents.state[id].loading &&
        findify.utils.isInViewport(infiniteScrollElement) &&
        hasNextPage(currentPage, lastPage)
      ) {
        findify.contents.state[id] = {
          ...findify.contents.state[id],
          loading: true,
        };

        const offset =
          findify.contents.state[id].meta.offset +
          findify.contents.state[id].meta.limit;
        const contentToLoad = {
          [id]: {
            title: findify.grid.liquid?.contents[id].title,
          },
        };
        const response = await findify.contents.api(contentToLoad, {
          offset,
        });
        await findify.grid.renderContents({
          [id]: {
            ...response[id],
            items: [...response[id].items].splice(
              response[id].meta.offset,
              response[id].meta.offset
            ),
          },
        });

        const updatedPage = offset / findify.contents.state[id].meta.limit + 1;
        if (lastPage <= updatedPage) {
          removeLoader();
        }
        findify.contents.state[id].loading = false;
      }
    };

    const removeLoader = () => {
      infiniteScrollElement?.remove();
      window.removeEventListener(
        "scroll",
        onScrollFunction,
        scrollEventOptions
      );
    };

    const lastPage = Math.ceil(
      findify.contents.state[id].meta.total /
        findify.contents.state[id].meta.limit
    );
    const currentPage =
      findify.contents.state[id].meta.offset /
        findify.contents.state[id].meta.limit +
      1;
    if (
      lastPage <= currentPage ||
      findify.contents.state[id].meta.total === 0
    ) {
      removeLoader();
    } else {
      window.addEventListener("scroll", onScrollFunction, scrollEventOptions);
    }
     // pagination

     const initPagination = () => {
      const links = document.querySelectorAll(
        `#${id}-content .findify-pagination__item.link`
      );

      links.forEach((link) =>
        link.addEventListener("click", async (e) => {
          e.preventDefault();
          const page = link.getAttribute("data-value");
          page && (await updateActivePage(page, id));
          initPagination();
        })
      );
    };
    initPagination();
  }
  });
};
