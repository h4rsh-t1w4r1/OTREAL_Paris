
const frameCount = 300;
const canvas = document.getElementById('frameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loaderFill');
const loaderText = document.getElementById('loaderText');

const images = [];
let loadedCount = 0;
let targetFrame = 1;
let currentFrame = 1;
let isInitialRenderDone = false;

// Helper to format frame path
function getFrameUrl(index) {
    const paddedIndex = String(index).padStart(3, '0');
    return `assets/frames/ezgif-frame-${paddedIndex}.jpg`;
}

// Set canvas dimensions considering device pixel ratio for sharp rendering
function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    renderFrame(Math.round(currentFrame));
}

// Render frame covering the full viewport maintaining aspect ratio
function renderFrame(frameIndex) {
    const img = images[frameIndex - 1];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // Cover scaling math
    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const drawX = (canvasWidth - drawWidth) / 2;
    const drawY = (canvasHeight - drawHeight) / 2;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

// Preload all frames
function preloadImages() {
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
        img.onload = () => {
            loadedCount++;
            const percent = Math.floor((loadedCount / frameCount) * 100);
            loaderFill.style.width = percent + '%';
            loaderText.textContent = percent + '%';

            if (i === 1 && !isInitialRenderDone) {
                renderFrame(1);
            }

            if (loadedCount === frameCount) {
                onAllLoaded();
            }
        };
        img.onerror = () => {
            loadedCount++;
            if (loadedCount === frameCount) {
                onAllLoaded();
            }
        };
        images.push(img);
    }
}

function onAllLoaded() {
    setTimeout(() => {
        loader.classList.add('hidden');
        renderFrame(1);
        isInitialRenderDone = true;
    }, 200);
}

// Initialize Lenis for smooth momentum scrolling
let lenis;
if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

// Update target frame based on scroll progress
function updateScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const progress = maxScroll > 0 ? Math.max(0, Math.min(1, scrollY / maxScroll)) : 0;

    targetFrame = 1 + progress * (frameCount - 1);
}

window.addEventListener('scroll', updateScroll, { passive: true });

// Smooth animation loop with lerping
let lastRenderedFrame = -1;
function animate() {
    // Lerp frame index for smooth transition
    const lerpFactor = 0.15;
    currentFrame += (targetFrame - currentFrame) * lerpFactor;

    const frameToDraw = Math.max(1, Math.min(frameCount, Math.round(currentFrame)));

    if (frameToDraw !== lastRenderedFrame) {
        renderFrame(frameToDraw);
        lastRenderedFrame = frameToDraw;
    }

    requestAnimationFrame(animate);
}

// Initialization
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
preloadImages();
animate();
