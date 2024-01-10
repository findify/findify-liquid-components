
    /*
*   Description: Bind infinite scroll event on window, and checking the div with id if shown and active and reached
*   @return void;
*/
const initFindifyContentEvents = () => {
    const contentIntegrations = Object.keys(findify.core.merchantConfig.features.content).map(id => ({ id }))
    contentIntegrations.forEach(({ id }) => {
        const infiniteScrollElement = document.getElementById(`${id}-infinite-scroll`);

        /*
        *   @return boolean;
        */
        const isContentDisplayed = () => {
            return document.getElementById(`${id}-content`).style.display === 'block';
        }
        /*
        *   Description: Check if element is in viewport at the moment based on its position on screen.
        *   @return boolean;
        */
        const isInViewport = (element) => {
            if(!element) return;
            const rect = element.getBoundingClientRect();
            const height = (window.innerHeight || document.documentElement.clientHeight);
            const width = (window.innerWidth || document.documentElement.clientWidth);
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <=  height + (height/1.5) && // Offset set to be 75%
                rect.right <= width
            );
        }

        const hasNextPage = (currentPage, lastPage) => currentPage <= lastPage;

        const scrollEventOptions = { passive: true };
        
        const onScrollFunction = async () => {
            const currentPage = (findify.contents.state[id].meta.offset / findify.contents.state[id].meta.limit) + 1;
            const lastPage = Math.ceil(findify.contents.state[id].meta.total / findify.contents.state[id].meta.limit);
            if(isContentDisplayed() && !findify.contents.state[id].loading && isInViewport(infiniteScrollElement) && hasNextPage(currentPage, lastPage)) {
                findify.contents.state[id] = { ...findify.contents.state[id], loading: true };

                const offset = findify.contents.state[id].meta.offset + findify.contents.state[id].meta.limit;
                const contentToLoad = { [id]: { title: findify.core.merchantConfig.features.content[id].title } };
                const response = await findify.contents.api(contentToLoad, {
                    offset,
                });
                await findify.grid.renderContents({ [id]: {
                    ...response[id], items: [...response[id].items].splice(response[id].meta.offset, response[id].meta.offset)
                }});

                const updatedPage = (offset / findify.contents.state[id].meta.limit) + 1;
                if(lastPage <= updatedPage) {
                    removeLoader()
                }
                findify.contents.state[id].loading = false;
            }
        };

        const removeLoader = () => {
            infiniteScrollElement?.remove();
            window.removeEventListener('scroll', onScrollFunction, scrollEventOptions)
        }

        const lastPage = Math.ceil(findify.contents.state[id].meta.total / findify.contents.state[id].meta.limit);
        const currentPage = (findify.contents.state[id].meta.offset / findify.contents.state[id].meta.limit) + 1;
        if(lastPage <= currentPage || findify.contents.state[id].meta.total === 0) {
            removeLoader()
        } else {
            window.addEventListener('scroll', onScrollFunction, scrollEventOptions)
        }
    })
}
