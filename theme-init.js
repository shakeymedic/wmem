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

// Wires the dark-mode button on whichever page has one
document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;
    var root = document.documentElement;
    toggle.setAttribute('aria-pressed', String(root.classList.contains('dark-mode')));
    toggle.addEventListener('click', function () {
        var isDark = root.classList.toggle('dark-mode');
        toggle.setAttribute('aria-pressed', String(isDark));
        try { localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled'); } catch (e) { /* storage blocked */ }
    });
});
