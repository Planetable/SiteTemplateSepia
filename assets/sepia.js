const getCleanerURL = (url) => {
  const parsedUrl = new URL(url);
  let path = parsedUrl.pathname;

  // Remove the file part, if present
  if (path.lastIndexOf('/') !== path.length - 1) {
    path = path.substring(0, path.lastIndexOf('/') + 1);
  }

  return `${parsedUrl.protocol}//${parsedUrl.host}${path}`;
}

const setTime = (item) => {
  const itemLink = item.dataset.itemLink;
  const articleCreated = Math.round(item.dataset.articleCreated * 1000);
  const pageType = item.dataset.pageType;
  
  // Set item time
  let time = item.querySelector('.time');
  if (time) {
    const dateOptions = { weekday: undefined, year: 'numeric', month: 'short', day: 'numeric' };
    let d = new Date(articleCreated);
    // if d is today, render it as relative time
    let now = new Date();
    let diff = (Math.floor(now.valueOf() / 1000) - Math.floor(d.valueOf() / 1000));
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
}

const decorateItem = (item) => {
  const articleId = item.dataset.articleId;
  const articleSlug = item.dataset.articleSlug;
  const titleLength = item.dataset.titleLength;
  const contentLength = item.dataset.contentLength;
  const pageType = item.dataset.pageType;
  let prefix = getCleanerURL(window.location.href);
  console.log(`Decorating: ${articleId} ${articleSlug} ${titleLength} ${contentLength} ${pageType} ${prefix}`);

  const videoFilename = item.dataset.videoFilename;
  const audioFilename = item.dataset.audioFilename;
  
  if (videoFilename) {
    // Add a video player
    let videoBox = document.createElement("div");
    videoBox.classList.add("video-box");
    let video = document.createElement("video");
    video.setAttribute("controls", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("preload", "metadata");
    let videoSrc = videoFilename;
    if (pageType == "blog") {
    } else {
      videoSrc = `${prefix}${articleId}/${videoFilename}`;
    }
    video.setAttribute("src", videoSrc);
    videoBox.appendChild(video);
    if (contentLength > 0) {
      videoBox.style.paddingBottom = "0px";
    }
    if (contentLength > 0) {
      // Insert videoBox before content
      let content = item.querySelector('.content');
      if (content) {
        item.insertBefore(videoBox, content);
      } else {
        item.appendChild(videoBox);
      }
    } else {
      item.appendChild(videoBox);
    }
  }

  if (audioFilename) {
    // Add a audio player
    let audioBox = document.createElement("div");
    audioBox.classList.add("audio-box");
    let audio = document.createElement("audio");
    audio.setAttribute("controls", "");
    let audioSrc = audioFilename;
    if (pageType == "blog") {
    } else {
      audioSrc = `${prefix}${articleId}/${audioFilename}`;
    }
    audio.setAttribute("src", audioSrc);
    audioBox.appendChild(audio);
    if (contentLength > 0) {
      audioBox.style.paddingBottom = "0px";
    }
    if (contentLength > 0) {
      // Insert videoBox before content
      let content = item.querySelector('.content');
      if (content) {
        item.insertBefore(audioBox, content);
      } else {
        item.appendChild(audioBox);
      }
    } else {
      item.appendChild(audioBox);
    }
  }

  // Adjust title size
  let titleBox = item.querySelector('.title-box');
  if (titleLength > 40) {
    titleBox.style.fontSize = "18px";
    titleBox.style.fontWeight = "500";
    titleBox.style.lineHeight = "1.5";
  }
  
  // Set item time
  setTime(item);
  
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