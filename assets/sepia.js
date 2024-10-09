String.prototype.isPicture = function () {
  return this.endsWith(".jpg") || this.endsWith(".jpeg") || this.endsWith(".png") || this.endsWith(".gif") || this.endsWith(".webp");
};

const showModal = (imageUrl) => {
  let modal = document.querySelector('#modal');
  if (modal) {
    let modalImg = document.querySelector('#modal-img');
    if (modalImg) {
      modalImg.src = imageUrl;
    }
    modal.style.opacity = "0";
    modal.style.display = "flex";
    setTimeout(() => {
      modal.style.opacity = "1";
    }, 10);
    document.body.style.overflow = "hidden";
  }
}

const dismissModal = () => {
  let modal = document.querySelector('#modal');
  if (modal) {
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }, 200);
  }
}

const donate = async () => {
  const chainToUse = '0x1';      // Ethereum mainnet
  // const chainToUse = '0xaa36a7'; // Sepolia
  const amount = document.getElementById('donate-amount').value;
  const etherscanPrefixes = {
    '0x1': 'https://etherscan.io/',
    '0xaa36a7': 'https://sepolia.etherscan.io/'
  };
  if (amount <= 0) {
    setMessage('Please enter a valid amount');
    return;
  }
  if (typeof window.ethereum === 'undefined') {
    setMessage('Wallet extension not installed');
    return;
  }
  try {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length === 0) {
      setMessage('Please connect your Ethereum account');
      return;
    }

    // Check if MetaMask is on mainnet
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    if (chainId !== chainToUse) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainToUse }],
        });
      } catch (switchError) {
        setMessage('Please switch to Ethereum mainnet');
        return;
      }
    }

    const from = accounts[0];
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          to: address,
          from: from,
          value: '0x' + (amount * 1e18).toString(16),
        },
      ],
    });
    const formattedTxHash = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;

    setMessage(`👌 Transaction sent: <a href="${etherscanPrefixes[chainToUse]}tx/${txHash}" target="_blank" rel="noopener noreferrer">${formattedTxHash}</a>`);
  } catch (err) {
    setMessage('🥲 Transaction failed: ' + err.message);
  }
};

const setMessage = (message) => {
  let messageBox = document.getElementById('message-box');
  if (messageBox) {
    messageBox.style.display = 'block';
    messageBox.innerHTML = message;
  }
}

const initDonateModal = (address) => {
  let donateTo = document.getElementById('donate-to');
  if (donateTo) {
    const formattedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    donateTo.innerHTML = `<a href="https://etherscan.io/address/${address}" target="_blank" rel="noopener noreferrer">${formattedAddress}</a>`;
  }

  let donateButton = document.getElementById('donate-button');
  donateButton.addEventListener('click', donate);

  let amountInput = document.getElementById('donate-amount');
  donateButton.disabled = amountInput.value <= 0;
  amountInput.addEventListener('change', () => {
    let value = amountInput.value;
    // Verify that the input is a valid float number
    donateButton.disabled = isNaN(value) || parseFloat(value) <= 0;
  });
}

const showDonateModal = () => {
  let modal = document.getElementById('donate-modal');
  let content = modal.querySelector('.donate-modal-content');
  if (content) {
    content.onclick = (e) => {
      e.stopPropagation();
    }
  }
  if (modal) {
    modal.style.opacity = "0";
    modal.style.display = "flex";
    setTimeout(() => {
      modal.style.opacity = "1";
    }, 10);
    document.body.style.overflow = "hidden";
  }
}

const dismissDonateModal = () => {
  let modal = document.getElementById('donate-modal');
  if (modal) {
    let messageBox = document.getElementById('message-box');
    if (messageBox) {
      messageBox.innerHTML = '';
      messageBox.style.display = 'none';
    }
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }, 200);
  }
}

const copyAddress = () => {
  if (address && navigator && navigator.clipboard) {
    navigator.clipboard.writeText(address).then(() => {
      setMessage('Address copied to clipboard');
    }).catch(err => {
      setMessage('Failed to copy address: ', err);
    });
  }
}

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
  const pinned = item.dataset.pinned;

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
      let ts = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      let ws = d.toLocaleDateString(undefined, { weekday: 'short' });
      s = ts + ' · ' + ds + ' · ' + ws;
    }
    if (pinned) {
      s = '📌' + '  ' + s;
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

  const attachments = JSON.parse(item.dataset.attachments.replace(/,]/g, "]"));
  const videoFilename = item.dataset.videoFilename;
  const audioFilename = item.dataset.audioFilename;
  const heroImageFilename = item.dataset.heroImageFilename;

  if (videoFilename) {
    // Add a video player
    let videoBox = document.createElement("div");
    videoBox.classList.add("video-box");
    let video = document.createElement("video");
    video.setAttribute("controls", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("preload", "auto");
    let videoSrc = videoFilename;
    let videoPoster = "_videoThumbnail.png"
    if (pageType == "blog") {
    } else {
      videoSrc = `${prefix}${articleId}/${videoFilename}`;
      videoPoster = `${prefix}${articleId}/_videoThumbnail.png`;
    }
    video.setAttribute("poster", videoPoster);
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
  /*
  if (titleLength > 40) {
    titleBox.style.fontSize = "18px";
    titleBox.style.fontWeight = "500";
    titleBox.style.lineHeight = "1.5";
  }
  */

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
      if (!img.closest('a')) {
        img.onclick = () => showModal(fixedSrc);
      }
    } else {
      console.log(`No need to fix src=${src} on this pageType=${pageType}`);
    }
  }
  // Append hero image as img-box if no img tag is present
  if (!itemHasImgs) {
    if (heroImageFilename && heroImageFilename != "_videoThumbnail.png") {
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
      heroImg.style.cursor = "pointer";
      heroImg.onclick = () => showModal(heroImg.src);
      imageBox.appendChild(heroImg);
      item.appendChild(imageBox);
    }
  }
  // Append attachments
  if (!itemHasImgs && attachments.length > 0) {
    let attachmentBox = document.createElement("div");
    attachmentBox.classList.add("attachment-box");
    let i = 0;
    for (let attachment of attachments) {
      if (attachment != heroImageFilename && attachment.isPicture()) {
        i = i + 1;
        let attachmentImg = document.createElement("img");
        if (pageType != "blog") {
          attachmentImg.setAttribute("src", `${prefix}${articleId}/${attachment}`);
        } else {
          attachmentImg.setAttribute("src", attachment);
        }
        attachmentImg.onclick = () => showModal(attachmentImg.src);
        attachmentBox.appendChild(attachmentImg);
      }
    }
    if (i > 0) {
      attachmentBox.style.paddingTop = "0px";
      item.appendChild(attachmentBox);
    }
  }
}