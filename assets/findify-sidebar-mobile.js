
const toggleDrawer = (openDirection, isDrawer, container) => {
    container.classList.toggle(openDirection);
    if (isDrawer) document.documentElement.classList.toggle('document-overflow-mob');
}

const bindToggleEvent = (isDrawer, domRefs, classNames) => {
    const btn = document.querySelector(domRefs.toggleSection);
    const container = document.querySelector(domRefs.section);
    const toggleEvent = () => toggleDrawer(domRefs.openDirection, isDrawer, container);
    
    btn?.addEventListener('click', toggleEvent); 
    
    if (isDrawer) {
        const headerBtn = document.querySelector(domRefs.drawerHeader);
        const seeResultsBtn = document.querySelector(domRefs.drawerSeeResults);

        headerBtn?.addEventListener('click', toggleEvent);
        seeResultsBtn?.addEventListener('click', toggleEvent);
        classNames.forEach(c => container?.classList.add(c));  
    }
}