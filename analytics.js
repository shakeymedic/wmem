// Cookie-free visitor counts with GoatCounter (https://www.goatcounter.com).
// No cookies or local storage, no personal data: GoatCounter records the page, referrer, browser,
// screen size and country, and never stores IP addresses. Counts only on emevidence.org itself,
// so deploy previews and wmem.netlify.app aren't counted.
//
// Counted: page views, tools launched, newsletter PDFs and audio opened, newsletter sign-up
// attempts, and searches that found no tool (as tool ideas). Dashboard: https://emevidence.goatcounter.com
(function () {
    'use strict';

    var ENDPOINT = 'https://emevidence.goatcounter.com/count';
    if (location.hostname !== 'emevidence.org' && location.hostname !== 'www.emevidence.org') return;

    function count(path, title, isEvent) {
        var params = [
            'p=' + encodeURIComponent(path),
            't=' + encodeURIComponent((title || '').slice(0, 120)),
            'r=' + encodeURIComponent(isEvent ? '' : document.referrer),
            's=' + encodeURIComponent(screen.width + ',' + screen.height + ',' + (window.devicePixelRatio || 1)),
            'rnd=' + Math.random().toString(36).slice(2)
        ];
        if (isEvent) params.push('e=true');
        var url = ENDPOINT + '?' + params.join('&');
        if (navigator.sendBeacon) {
            try { if (navigator.sendBeacon(url)) return; } catch (e) { /* fall back to an image */ }
        }
        new Image().src = url;
    }

    count(location.pathname, document.title, false);

    document.addEventListener('click', function (e) {
        var link = e.target.closest && e.target.closest('a');
        if (!link) return;
        var card = link.closest('.tool-card');
        if (card && link.classList.contains('tool-link')) {
            count('tool/' + card.getAttribute('data-tool-id'), link.getAttribute('data-name'), true);
            return;
        }
        var drive = /drive\.google\.com\/file\/d\/([^/?#]+)/.exec(link.href || '');
        if (drive) {
            count('newsletter/' + drive[1], link.textContent.replace(/\s+/g, ' ').trim(), true);
        }
    }, true);

    document.addEventListener('submit', function (e) {
        if (e.target && e.target.closest && e.target.closest('#newsletter')) count('subscribe-attempt', 'Newsletter sign-up', true);
    }, true);

    // Searches that find nothing suggest tools people want; recorded once they've stopped typing
    var noResults = document.getElementById('noResults');
    var search = document.getElementById('searchInput');
    if (noResults && search) {
        var timer = null;
        var lastSent = '';
        search.addEventListener('input', function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                var term = search.value.trim().toLowerCase().slice(0, 40);
                if (term.length >= 3 && term !== lastSent && noResults.style.display !== 'none') {
                    lastSent = term;
                    count('search-no-results/' + term, 'No tool found for "' + term + '"', true);
                }
            }, 2000);
        });
    }
})();
