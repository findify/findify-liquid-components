
    /*
    *   Contains reference for getting contents such as page, loading
    */
    const contentLimit = 16;

    /*
    *   Description: Get contents from Findify Merchant configuration and map only needed property.
    *   @returns array of { id, title };
    */
    const getContentIntegrations = () => {
        const contents = window.FindifyMerchantConfig.features.content;
        const contentsKeys = Object.keys(contents);
        Findify.state.content = contentsKeys.reduce((acc, key) => ({ ...acc, [key]: { page: 1, title: contents[key].title } }), {})
        const contentIngrationMapping = (key) => ({ id: key, title: contents[key].title });
        return contentsKeys.map(contentIngrationMapping);
    }

    /*
    *   Description: Initialization function.
    *   @returns void;
    */
    const loadFindifyContent = async(contentsToLoad, pageChange = false) => {
            /*
            *
            *
            */
            const loadContent = async (contentIntegrationsParam) => {
                const current = contentIntegrationsParam[0];

                const getOffset = () => {
                    const page = Findify.state.content[current.id].page
                    return page === 1 ? 0 : (page-1)*contentLimit;
                }
                
                return await Findify.utils.api.contents([{ content_id: current.id, title: current.title, offset: getOffset() }])
            }

            /*
            *   Description: Get contents promises
            *   @returns array of Promise;
            */
            const getContents = async (content) => {
                const contentsResponses = !pageChange ? Findify.state.contents : loadContent(contentIntegrations);
                
                const contentMapping = (response, index) => {
                        // Update global object with count
                        const current = contentIntegrations[index];
                        if(current) {
                            Findify.state.content[current.id] = { ...Findify.state.content[current.id], count: response.value.meta.total }
                            return ({
                                id: current.id,
                                title: current.title,
                                data: response.value,
                            })
                        } else {
                            return;
                        }
                    }

                const mapping = (contents) => contents.map(contentMapping).filter(content => !!content);

                    /*if(pageChange) {
                        return mapping(contentsResponses);
                    } else {*/
                        return contentsResponses?.then((responses) => {
                            const result = mapping(responses);
                            return result;
                        });
                    //}
            }

            /*
            *   Description: Transform contents to strings that renderAPI and liquid parsing can format.
            *   @returns { <id>: string };
            */
            const getContentsLiquidQueries = async (contents) => {
                const sanitizeItem = (arg) => arg.replaceAll('&', '::');
                const getImageUrl = (item) => item.image_url ? item.image_url : item.thumbnail_url;
                const mapItem = (item) => sanitizeItem(`${getImageUrl(item)}~${item.url}`);
                const mapQueryContents = (id, title, items, total) => `${id}^${title}^${total}^${items.map(mapItem).join(';')}`;
                const transformedContents = contents.map(({ id, title, data }) => ({ id, count: data.meta.total, data: data.items, query: mapQueryContents(id, title, data.items, data.meta.total) }));
                return transformedContents;
            }

            /*
            *   Description: Query renderAPI and retrieve liquid parsed, get only content cards
            *   @return { id, count, data, cards: HTML }[][]
            */
            const getHTMLContents = async (contentQueries) => {
                const promises = [];
                contentQueries.forEach(({ query }) => {
                    // DO ONE ONLY CALL PASSING ALL TEMPLATES
                    const section_name = 'findify-grid-content';
                    const endpoint = `/search?section_id=${section_name}&content=${query}`
                    const promise = fetch(endpoint, { method: 'post' });
                    promises.push(promise);
                })
                
                const responses = await Promise.allSettled(promises);
                const results = [];
                let index = 0;
                for await (const response of responses) {
                    const currentContentQuery = contentQueries[index++];
                    const raw = await response.value.text();
                    const containerHTML = new DOMParser().parseFromString(raw, 'text/html').querySelector('div');
                    const contentListHTML = containerHTML.querySelector('#response');
                    const contentListNodes = contentListHTML.childNodes;
                    const contentCards = Array.from(contentListNodes).filter(node => !['#text', '#comment', 'link', 'noscript', 'style', 'script'].includes(node.nodeName?.toLowerCase()));
                    results.push({ 
                        ...currentContentQuery,
                        cards: contentCards
                    });
                }
                return results;
            }

            /*
            *   Description: Insert content cards HTML in respective DOM element
            *   @return void;
            */
            const renderHTMLContents = (contents) => {
                contents.forEach(({ id, cards, count, data }) => {
                    // Populate target container
                    const container = Findify.state.html.main.querySelector(`#${id}`);
                    cards.forEach((card, index) => {
                        const cardTitle = card.querySelector(`.findify-content-title-selector`);
                        cardTitle.innerHTML = data[index].title;
                        container.appendChild(card);
                    });
                    // Set loading false for this content_id
                    Findify.state.content[id].loading = false;
                });
            }


            /*
            * Description: Wait for Findify based main skeleton html strucure to be fully applied
            * @return promise
            */

            /*
            * Description: Wait for Findify based main skeleton html strucure to be fully applied
            * @return promise
            */
            const isMainHTMLReady = () => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        clearInterval(interval);
                        reject();
                    }, 300000) // 5 minutes

                    const interval = setInterval(() => {
                        if(!!Findify.state.html?.main) {
                            resolve();
                        }
                    }, 100);
                });
            }
        
        const contentIntegrations = contentsToLoad?.length ? contentsToLoad : getContentIntegrations();
        const contents = await getContents(contentIntegrations);
        const contentLiquidQueries = await getContentsLiquidQueries(contents);
        const htmlContents = await getHTMLContents(contentLiquidQueries);
        return isMainHTMLReady().then(async () => {
            await renderHTMLContents(htmlContents);
        });
    }

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
