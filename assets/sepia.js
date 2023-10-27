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
  const itemLink = item.dataset.itemLink;
  const articleId = item.dataset.articleId;
  const articleCreated = Math.round(item.dataset.articleCreated * 1000);
  const articleSlug = item.dataset.articleSlug;
  const titleLength = item.dataset.titleLength;
  const contentLength = item.dataset.contentLength;
  const pageType = item.dataset.pageType;
  let prefix = getCleanerURL(window.location.href);
  console.log(`Decorating: ${articleId} ${articleSlug} ${titleLength} ${contentLength} ${pageType} ${prefix}`);
  // Set item time
  let time = item.querySelector('.time');
  if (time) {
    const dateOptions = { weekday: undefined, year: 'numeric', month: 'short', day: 'numeric' };
    let d = new Date(articleCreated);
    console.log(`d=${d}`);
    // if d is today, render it as relative time
    let now = new Date();
    console.log(`now=${now}`);
    let diff = (Math.floor(now.valueOf() / 1000) - Math.floor(d.valueOf() / 1000));
    console.log(`diff=${diff}`);
    let s = '';
    if (diff < 86400) {
      const rtf = new Intl.RelativeTimeFormat(undefined, { style: 'short' });
      value = -1 * diff;
      if (diff < 60) {
        s = rtf.format(Math.floor(value), 'second');
      } else if (diff < 3600) {
        s = rtf.format(Math.floor(value / 60), 'minute');
      } else {
        s = rtf.format(Math.floor(value / 3600), 'hour');
      }
    } else {
      let ds = d.toLocaleDateString(undefined, dateOptions);
      let ts = d.toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'});
      s = ts + ' · ' + ds;  
    }
    if (pageType == "blog") {
      time.textContent = s;
    } else {
      // Wrap time in link
      let timeLink = document.createElement("a");
      timeLink.setAttribute("href", itemLink);
      timeLink.setAttribute("title", s);
      timeLink.classList.add("item-link");
      timeLink.textContent = s;
      time.textContent = '';
      time.appendChild(timeLink);
    }
  }
  // Fix relative paths
  let imgs = item.querySelectorAll('img');
  let itemHasImgs = false;
  for (let img of imgs) {
    let src = img.getAttribute("src");
    if (src) {
      itemHasImgs = true;
    }
    let needsToFix = false;
    if (pageType == "blog") {
    } else {
      if (!src.startsWith("https://") && !src.startsWith("http://") && !src.startsWith("/")) {
        // It is a relative path
        console.log(`Relative path found src=${src}`);
        console.log(`prefix=${prefix}`);
        if (articleSlug) {
          if (!prefix.includes(articleSlug)) {
            console.log(`prefix does not include articleSlug=${articleSlug}`);
            needsToFix = true;
          }
        } else {
          if (!prefix.includes(articleId) && !src.includes(articleId)) {
            console.log(`prefix and src does not include articleId=${articleId}`);
            needsToFix = true;
          }
        }
      }
    }
    console.log(`needsToFix=${needsToFix} src=${src} on this pageType=${pageType}`);
    if (needsToFix === true) {
      let fixedSrc = `${prefix}${articleId}/${src}`;
      img.setAttribute("src", fixedSrc);
    } else {
      console.log(`No need to fix src=${src} on this pageType=${pageType}`);
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