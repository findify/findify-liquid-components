const initFindifySortingEvents = () => {
    
    const selectors = {
        body: '#findify-sorting',
        button: '#findify-sorting-button',
        dropdown: '#findify-sorting-list',
        options: '#findify-sorting-list > li',
        modalSortingToggler: '#findify-sorting-toggler',
        modalBody: '#findify-sorting-sidebar',
        modalHeader: '#findify-modal-sorting-header',
        modalSeeResults: '#findify-modal-sorting-footer'
    };
    
    const domRefs = {
        toggleSection: selectors.modalSortingToggler,
        section: selectors.modalBody,
        drawerHeader: selectors.modalHeader,
        drawerSeeResults: selectors.modalSeeResults,
        openDirection: 'open-right'
    };

    const classNames = ['findify-modal', 'animated-right', 'right'];

    const bindCloseOnOutsideClick = () => {
        const body = document.querySelector(selectors.body);
        const list = document.querySelector(selectors.dropdown);

        const onOutsideClick = e => {
            if (!list.contains(e.target)) {
                body.classList.remove('open');
                removeOutsideClick();
            } 
        }
        
        const removeOutsideClick = () => document.removeEventListener('click', onOutsideClick);
        document.addEventListener('click', onOutsideClick);
    }

    const bindToggle = () => {

        const onClick = () => {
            const body = document.querySelector(selectors.body);
            const isOpen = body.classList.contains('open');

            body.classList.toggle('open');

            if(!isOpen) {
                setTimeout(() => {
                    bindCloseOnOutsideClick();
                }, 100);
            } 
        }

        const element = document.querySelector(selectors.button);
        element?.addEventListener('click', onClick);
    }

    const bindSelectOption = () => {
        const options = document.querySelectorAll(selectors.options);

        [...options].forEach(option => {
            const field = option.getAttribute('field');
            const order = option.getAttribute('order');
            const sorting = { order_by: order, sort_by: field };

            option.addEventListener('click', () => {
                findify.sorting.setState(sorting);
                findify.grid.load();
                toggleDrawer('open-right', true, document.querySelector(selectors.modalBody));
            });
  
            if (findify.sorting.state.sort_by === field && findify.sorting.order_by === order) {
                option.classList.add('selected');
            }
        });
    }

    bindToggle();
    bindSelectOption();
    bindToggleEvent(true, domRefs, classNames);
}