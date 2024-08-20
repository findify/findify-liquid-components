const filterSearch = (filter_group_id, input_id) => {
    const filterSelector = '.findify-filters-checkbox-item';
    const filterTextSelector = 'label';

    const filterGroupElement = document.getElementById(filter_group_id);
    const filters = filterGroupElement.querySelectorAll(filterSelector);
    const input = document.getElementById(input_id);

    const inputHandler = (e) => {
        const value = e.target.value.trim().toLowerCase();
        filters.forEach(item => {
            const text = item.querySelector(filterTextSelector).innerText.trim().toLowerCase();
            const shouldHide = value && !text.includes(value);
            item.setAttribute("aria-hidden", shouldHide.toString());
        });
    };

    input.addEventListener("input", inputHandler);
};