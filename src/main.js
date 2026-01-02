import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./assets/main.css";

// Track touch start position to detect scroll attempts
let touchStartY = 0;
let touchStartX = 0;
let isScrolling = false;

// Check if element is inside a dropdown
const isInsideDropdown = (element) => {
  let current = element;
  while (current && current !== document.body) {
    if (current.classList && current.classList.contains('dropdown-scrollbar')) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
};

// Prevent all scrolling globally
const preventScroll = (e) => {
  // Allow interactions with form inputs
  const target = e.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement) {
    return;
  }
  // Allow scrolling inside dropdowns
  if (isInsideDropdown(target)) {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  return false;
};

// Prevent scroll on various events
document.addEventListener('wheel', preventScroll, { passive: false });
document.addEventListener('mousewheel', preventScroll, { passive: false });
document.addEventListener('DOMMouseScroll', preventScroll, { passive: false });

// Enhanced mobile touch handling
document.addEventListener('touchstart', (e) => {
  const target = e.target;
  // Allow touch on form elements
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    isScrolling = false;
    return;
  }
  // For non-form elements, prevent default to stop any scroll initiation
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
  isScrolling = false;
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  const target = e.target;
  const touch = e.touches[0];
  const deltaY = Math.abs(touch.clientY - touchStartY);
  const deltaX = Math.abs(touch.clientX - touchStartX);
  
  // Allow scrolling inside dropdowns
  if (isInsideDropdown(target)) {
    return;
  }
  
  // Allow touch on form elements, but prevent scrolling
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement) {
    // If it's a significant vertical movement, it's likely a scroll attempt
    if (deltaY > 5 || deltaX > 5) {
      // Check if we're trying to scroll the page (not just interacting with input)
      const isInputScrollable = target.scrollHeight > target.clientHeight;
      if (!isInputScrollable) {
        e.preventDefault();
      }
    }
    return;
  }
  
  // For all other elements, always prevent scroll
  e.preventDefault();
  e.stopPropagation();
}, { passive: false });

document.addEventListener('touchend', (e) => {
  isScrolling = false;
}, { passive: false });

// Prevent scroll events (but allow scrolling inside dropdowns)
document.addEventListener('scroll', (e) => {
  const target = e.target;
  // Allow scrolling inside dropdowns
  if (isInsideDropdown(target)) {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  // Force scroll position to stay at top
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}, { passive: false });

// Prevent keyboard scrolling (but allow typing in inputs)
document.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
    if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
    }
  }
});

// Prevent pull-to-refresh and overscroll on mobile
document.addEventListener('touchcancel', (e) => {
  e.preventDefault();
}, { passive: false });

// Lock scroll position on load and resize
const lockScroll = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

window.addEventListener('load', lockScroll);
window.addEventListener('resize', lockScroll);
window.addEventListener('orientationchange', lockScroll);

// Continuously prevent any scroll attempts
setInterval(() => {
  if (window.scrollY !== 0 || document.documentElement.scrollTop !== 0 || document.body.scrollTop !== 0) {
    lockScroll();
  }
}, 100);

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount("#app");
