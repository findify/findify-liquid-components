/*
 *   Description: Bind infinite scroll event on window, and checking the div with id if shown and active and reached
 *   @return void;
 */
const initFindifyContentEvents = () => {
  const contentIntegrations = Object.keys(
    findify.core.merchantConfig.features.content
  ).map((id) => ({ id }));
  contentIntegrations.forEach(({ id }) => {
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
            title: findify.core.merchantConfig.features.content[id].title,
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
  });
};
