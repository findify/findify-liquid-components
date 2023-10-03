const bindToggleEvent = (isDrawer, domRefs, classNames) => {
    const btn = document.querySelector(domRefs.toggleSection);
    const container = document.querySelector(domRefs.section);
    
    const toggle = () => {
        container.classList.toggle(domRefs.openDirection);
        if (isDrawer) document.documentElement.classList.toggle('document-overflow');
    }
    
    btn.addEventListener('click', toggle);
    
    if (isDrawer) {
        const headerBtn = document.querySelector(domRefs.drawerHeader);
        const seeResultsBtn = document.querySelector(domRefs.drawerSeeResults);

        headerBtn.addEventListener('click', toggle);
        seeResultsBtn.addEventListener('click', toggle);
        classNames.forEach(c => container.classList.add(c));  
    }
}