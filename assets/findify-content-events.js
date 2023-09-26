/*
*   Description: Bind infinite scroll event on window, and checking the div with id if shown and active and reached
*   @return void;
*/
const initFindifyContentEvents = () => {
    const contentIntegrations = Object.keys(Findify.merchantConfig.features.content)
        .filter(key => !['scrollTop'].includes(key))
        .map(id => ({ id }))
    contentIntegrations.forEach(({ id }) => {
        const infiniteScrollElement = document.getElementById(`${id}-infinite-scroll`);

        /*
        *   @return boolean;
        */
        const isContentDisplayed = (content_id) => {
            return document.getElementById(`${content_id}-content`).style.display === 'block';
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

        const hasNextPage = (integration) => {
            const lastPage = Math.ceil(integration.count / contentLimit);
            return integration.page <= lastPage;
        }

        const scrollEventOptions = { passive: true };
        
        const onScrollFunction = () => {
            if(isContentDisplayed(id) && !Findify.state.content[id].loading && isInViewport(infiniteScrollElement) && hasNextPage(Findify.state.content[id])) {
                Findify.state.content[id] = { ...Findify.state.content[id], page: Findify.state.content[id].page+1, loading: true }
                const currentContent = { id, title: Findify.state.content[id].title };
                loadFindifyContent([currentContent], true);

                // Check pages available and if more items can be rendered; If NOT, remove inifinite loader
                const lastPage = Math.ceil(Findify.state.content[id].count / contentLimit);
                if(lastPage <= Findify.state.content[id].page) {
                    removeLoader(Findify.state.content[id])
                }
            }
        };

        const removeLoader = () => {
            infiniteScrollElement?.remove();
            window.removeEventListener('scroll', onScrollFunction, scrollEventOptions)
        }

        const lastPage = Math.ceil(Findify.state.content[id].count / contentLimit);
        if(lastPage === Findify.state.content[id].page || Findify.state.content[id].count === 0) {
            removeLoader(Findify.state.content[id])
        }

        window.addEventListener('scroll', onScrollFunction, scrollEventOptions)
    })
}