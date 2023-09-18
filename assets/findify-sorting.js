const initFindifySortingEvents = () => {
    const selectors = {
        body: '#findify-sorting',
        button: '#findify-sorting-button',
        dropdown: '#findify-sorting-list',
        options: '#findify-sorting-list > li',
    }

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
            
            if(isOpen) {
                body.classList.remove('open');
            } else {
                body.classList.add('open');
                setTimeout(() => {
                    bindCloseOnOutsideClick();
                }, 100);
            }
        }

        const element = document.querySelector(selectors.button);
        element.addEventListener('click', onClick);
    }

    const bindSelectOption = () => {
        const options = document.querySelectorAll(selectors.options);;

        [...options].forEach(option => {
            const field = option.getAttribute('field');
            const order = option.getAttribute('order');
            const sorting = { order_by: order, sort_by: field };

            option.addEventListener('click', () => {
                Findify.utils.params.sorting.set(sorting);
            });
        });
    }

    bindToggle();
    bindSelectOption();
}