// Applies dark mode before the page paints, so there is no light flash.
// A saved choice wins; otherwise follow the device's setting.
(function () {
    var saved = null;
    try { saved = localStorage.getItem('darkMode'); } catch (e) { /* storage blocked */ }
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'enabled' || (saved === null && prefersDark)) {
        document.documentElement.classList.add('dark-mode');
    }
}());
