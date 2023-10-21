const getCleanerURL = (url) => {
  const parsedUrl = new URL(url);
  let path = parsedUrl.pathname;
  
  // Remove the file part, if present
  if (path.lastIndexOf('/') !== path.length - 1) {
    path = path.substring(0, path.lastIndexOf('/') + 1);
  }

  return `${parsedUrl.protocol}//${parsedUrl.host}${path}`;
}

const decorateItem = (item) => {
  const articleId = item.dataset.articleId;
  const titleLength = item.dataset.titleLength;
  const contentLength = item.dataset.contentLength;
  const pageType = item.dataset.pageType;
  // Fix relative paths
  let imgs = item.querySelectorAll('img');
  let itemHasImgs = false;
  for (let img of imgs) {
    let src = img.getAttribute("src");
    if (src) {
      itemHasImgs = true;
    }
    if (!src.startsWith("https://") && !src.startsWith("http://") && !src.startsWith("/")) {
      // It is a relative path
      let prefix = getCleanerURL(window.location.href);
      if (!prefix.includes(articleId) && !src.includes(articleId)) {
        let fixedSrc = `${prefix}${articleId}/${src}`;
        img.setAttribute("src", fixedSrc);
      } else {
        console.log(`No need to fix prefix for ${src}`);
      }
    }
  }
  // Append hero image as img-box if no img tag is present
  if (!itemHasImgs) {
    let heroImageFilename = item.dataset.heroImageFilename;
    if (heroImageFilename) {
      let imageBox = document.createElement("div");
      imageBox.classList.add("image-box");
      if (contentLength > 0) {
        imageBox.style.paddingTop = "0px";
      }
      let heroImg = document.createElement("img");
      let prefix = getCleanerURL(window.location.href);
      if (!prefix.includes(articleId) && !heroImageFilename.includes(articleId)) {
        heroImg.setAttribute("src", `${prefix}${articleId}/${heroImageFilename}`);
      } else {
        heroImg.setAttribute("src", heroImageFilename);
      }
      if (pageType == "blog") {
        heroImg.setAttribute("style", "max-width: 100%; height: auto; max-height: initial; aspect-ratio: initial; object-fit: cover;");
      }
      imageBox.appendChild(heroImg);
      item.appendChild(imageBox);
    }
  }
}