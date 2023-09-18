
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
                        return contentsResponses.then((responses) => {
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
                    const endpoint = `/search?section_id=findify-contents&content=${query}`
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
