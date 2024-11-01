let swatchWidth = 32;

function getMaxSwatches(containerWidth) {
  const maxSwatches = Math.floor((containerWidth - 60) / swatchWidth);
  const maxWidth = (maxSwatches * swatchWidth) - 8;

  return { maxSwatches, maxWidth };
}

function initializeDisabledSwatches(product) {
  
  const containerWidth = product.querySelector('.findify-color-swatches-outer').getBoundingClientRect().width;

  if(containerWidth < 1) {
    return false;
  }

  const { maxSwatches, maxWidth } = getMaxSwatches(containerWidth);

  const swatchesCount = parseInt(product.querySelector('.findify-color-swatches-inner').getAttribute('data-swatches-count'));
  const exceedsMax = swatchesCount > maxSwatches;
  const swiperDOM = product.querySelector('.swiper-wrapper');
  const moreDOM = product.querySelector('.findify-more-swatches');
  swiperDOM.style.maxWidth = maxWidth + 'px';

  const children = Array.from(swiperDOM.children);
  children.slice(0, maxSwatches).forEach(child => child.style.display = null);
  children.slice(maxSwatches).forEach(child => child.style.display = "none");

  if(exceedsMax) {
    const moreCount = swatchesCount - maxSwatches;
    moreDOM.innerText = `+ ${moreCount} ${moreCount === 1 ? 'color' : 'colors'}`;
    moreDOM.style.display = 'block';
    
  } else {
    moreDOM.style.display = 'none';
  }

  return maxSwatches;
}
