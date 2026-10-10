// Audio summaries: a "Play audio summary" button opens a player on the page. An issue with a
// spotifyEpisodeId gets Spotify's episode player (the podcast); otherwise Google Drive's own player
// for its audioId, a Drive file shared as "Anyone with the link". Drive refuses to stream its files
// straight into an <audio> element on another site (it answers 403 to any cross-site request), so
// the player is Drive's preview page in a frame. netlify.toml's frame-src allows both players.
// Like the PDF preview, nothing loads from Google until someone asks for it.
// Used by the home page, /newsletters/ and each issue's own page.

const audioDriveUrl = id => `https://drive.google.com/file/d/${encodeURIComponent(id)}/view?usp=sharing`;
const audioPlayerUrl = id => `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
const spotifyEpisodeUrl = id => `https://open.spotify.com/episode/${encodeURIComponent(id)}`;
const spotifyPlayerUrl = id => `https://open.spotify.com/embed/episode/${encodeURIComponent(id)}`;

const audioButtonIcon = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;flex-shrink:0;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;

// The button for an archive list (empty if the issue has no audio); the player opens straight
// after it. Pass the issue's link object; the IDs and title are escaped here.
function audioButtonHTML(link, title) {
    if (!link.audioId && !link.spotifyEpisodeId) return "";
    const esc = v => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const spotify = link.spotifyEpisodeId ? ` data-spotify-id="${esc(link.spotifyEpisodeId)}"` : "";
    return `<button type="button" class="sidebar-link sidebar-link-audio" data-audio-id="${esc(link.audioId || "")}"${spotify} data-audio-title="${esc(title)}" aria-expanded="false">${audioButtonIcon}<span class="audio-btn-text">Play audio summary</span></button>`;
}

function audioPanel(id, title, spotifyId) {
    const panel = document.createElement("div");
    const frame = document.createElement("iframe");
    frame.title = `Audio summary: ${title}`;
    const note = document.createElement("p");
    note.className = "audio-panel-note";
    if (spotifyId) {
        // Spotify's player can stop after a 30-second preview on some devices, so the Drive copy stays one tap away
        panel.className = "audio-panel audio-panel-spotify";
        frame.src = spotifyPlayerUrl(spotifyId);
        frame.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
        note.innerHTML = id
            ? `Only hearing a preview? <a href="${audioDriveUrl(id)}" target="_blank" rel="noopener">Listen in Google Drive</a> or <a href="${spotifyEpisodeUrl(spotifyId)}" target="_blank" rel="noopener">open it in Spotify</a>`
            : `Only hearing a preview? <a href="${spotifyEpisodeUrl(spotifyId)}" target="_blank" rel="noopener">Open it in Spotify</a>`;
    } else {
        panel.className = "audio-panel";
        frame.src = audioPlayerUrl(id);
        frame.allow = "autoplay";
        note.innerHTML = `Press play above. Not working? <a href="${audioDriveUrl(id)}" target="_blank" rel="noopener">Open it in Google Drive</a>`;
    }
    panel.append(frame, note);
    return panel;
}

// Opens or closes the player for a [data-audio-id] button. It goes in the element named by
// data-audio-panel if there is one, otherwise straight after the button. Closing removes the
// frame, which also stops the audio.
function toggleAudio(btn) {
    const opening = btn.getAttribute("aria-expanded") !== "true";
    const target = btn.dataset.audioPanel ? document.getElementById(btn.dataset.audioPanel) : null;
    if (opening) {
        const panel = audioPanel(btn.dataset.audioId, btn.dataset.audioTitle || "", btn.dataset.spotifyId);
        if (target) {
            target.replaceChildren(panel);
            target.hidden = false;
        } else {
            btn.after(panel);
        }
    } else if (target) {
        target.replaceChildren();
        target.hidden = true;
    } else if (btn.nextElementSibling && btn.nextElementSibling.classList.contains("audio-panel")) {
        btn.nextElementSibling.remove();
    }
    btn.setAttribute("aria-expanded", String(opening));
    const label = btn.querySelector(".audio-btn-text");
    if (label) label.textContent = opening ? "Hide audio player" : (btn.dataset.audioLabel || "Play audio summary");
}

document.addEventListener("click", (e) => {
    const btn = e.target.closest && e.target.closest("button[data-audio-id]");
    if (btn) toggleAudio(btn);
});
