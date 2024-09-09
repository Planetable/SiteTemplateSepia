// Select all video elements on the page
const videos = document.querySelectorAll('video');

videos.forEach(video => {
    video.muted = true; // Mute the video to avoid autoplay restrictions
    video.loop = true; // Enable video looping

    // Initially, hide the controls
    video.controls = false;

    // Show controls when hovering over the video
    video.addEventListener('mouseover', function () {
        video.controls = true;
    });

    // Hide controls when the mouse leaves the video
    video.addEventListener('mouseout', function () {
        video.controls = false;
    });
});

// Function to play/pause videos based on visibility
const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
            // Video is in the viewport, start playing
            video.play().catch(error => {
                console.error("Video failed to play automatically:", error);
            });
        } else {
            // Video is out of the viewport, pause playing
            video.pause();
        }
    });
}, {
    threshold: 0.5 // Adjust this threshold if needed
});

// Observe each video
videos.forEach(video => {
    videoObserver.observe(video);
});