const songs = [
  ['sailor song', 'gigi perez', 'songs/gigi-perez-sailor-song-lyrics-128-ytshorts.savetube.me.mp3'],
  ["harvey", "her's", 'songs/her-s-harvey-lyric-video-128-ytshorts.savetube.me.mp3'],
  ['i bet on losing dogs', 'mitski', 'songs/mitski-i-bet-on-losing-dogs-lyrics-128-ytshorts.savetube.me.mp3'],
  ['no one noticed', 'the marías', 'songs/no-one-noticed-extended-spanish-128-ytshorts.savetube.me.mp3'],
  ['saccharine', 'jazmin bean', 'songs/saccharine-by-jazmin-bean-lyrics-128-ytshorts.savetube.me.mp3'],
  ['nobody new', 'the marías', 'songs/the-marias-nobody-new-128-ytshorts.savetube.me.mp3'],
  ['the red means i love you', 'madds buckley', 'songs/the-red-means-i-love-you-madds-buckley-128-ytshorts.savetube.me.mp3']
];
const lyricFiles = [
  'songs/lyrics to sailor song.txt', 'songs/lyrics to harvey by her\'s.txt', 'songs/lyrics to i bet on loosing dogs.txt',
  'songs/lyrics to no one noticed.txt', 'songs/lyrics to saccharine song.txt', 'songs/lyrics to nobody new.txt', 'songs/lyrics to the red means i love you song.txt'
];
const splash = document.querySelector('#splash'), enterScreen = document.querySelector('#enter-screen'), site = document.querySelector('#site');
document.querySelectorAll('.ticker-track').forEach(track => {
  const group = document.createElement('div'); group.className = 'ticker-group';
  for (let i = 0; i < 12; i++) { const word = document.createElement('span'); word.innerHTML = 'cherrilady <b>&#9825;</b>'; group.append(word); }
  track.append(group, group.cloneNode(true));
});
const motionButton = document.querySelector('#motion-toggle');
motionButton.onclick = () => { const paused = document.body.classList.toggle('motion-paused'); motionButton.textContent = paused ? '\u25b6' : '\u2161'; motionButton.setAttribute('aria-label', paused ? 'Resume decorative motion' : 'Pause decorative motion'); };
const loadingStart = performance.now();
function loadingFrame(now) {
  const fraction = Math.min(1, (now - loadingStart) / 2200);
  document.querySelector('#loader').style.width = `${fraction * 100}%`;
  document.querySelector('#loading-percent').textContent = `${String(Math.floor(fraction * 100)).padStart(2, '0')}%`;
  document.querySelector('#loading-copy').textContent = fraction < .4 ? 'gathering the petals' : fraction < .8 ? 'setting the mood' : 'ready for you \u2661';
  if (fraction < 1) requestAnimationFrame(loadingFrame);
  else { splash.classList.add('is-hidden'); enterScreen.classList.remove('is-hidden'); document.querySelector('#enter-button').focus({ preventScroll:true }); }
}
requestAnimationFrame(loadingFrame);
document.querySelector('#enter-button').onclick = () => { enterScreen.classList.add('is-hidden'); site.classList.remove('is-hidden'); if (document.querySelector('#enter-sound').checked) startPlayback(); };

const audio = document.querySelector('#audio'), list = document.querySelector('#playlist'), play = document.querySelector('#play'), progress = document.querySelector('#progress');
const musicScreen = document.querySelector('#music-screen'), lyricsLines = document.querySelector('#lyrics-lines'), lyricsNote = document.querySelector('#lyrics-note'), songRow = document.querySelector('#music-song-row'), aboutScreen = document.querySelector('#about-screen');
const socialScreen = document.querySelector('#social-screen');
const syncedLyrics = {}, lyricCache = {};
let current = 0;
songs.forEach(([title, artist], index) => { const item = document.createElement('li'); item.textContent = title; item.title = `${title} — ${artist}`; item.onclick = () => load(index, true); list.append(item); });
songs.forEach(([title, artist], index) => {
  const item = document.createElement('button');
  const number = document.createElement('span'); number.className = 'song-number'; number.textContent = String(index + 1).padStart(2, '0');
  const label = document.createElement('span'), name = document.createElement('strong'), by = document.createElement('small'); name.textContent = title; by.textContent = artist; label.append(name, by);
  const mark = document.createElement('span'); mark.className = 'song-mark'; mark.textContent = '\u2661'; mark.setAttribute('aria-hidden','true');
  item.append(number, label, mark); item.onclick = () => load(index, true); songRow.append(item);
});
async function renderLyrics() { const track = current; lyricsLines.replaceChildren(); lyricsNote.textContent = 'LOADING LYRIC SHEET...'; if (!lyricCache[track]) { try { const response = await fetch(encodeURI(lyricFiles[track])); if (!response.ok) throw new Error('not found'); lyricCache[track] = (await response.text()).split(/\r?\n/).map(line => line.trim()).filter(Boolean); } catch { lyricCache[track] = []; } } if (track !== current) return; const rawLines = lyricCache[track]; if (!rawLines.length) { const line = document.createElement('p'); line.textContent = 'lyrics could not be loaded for this track'; line.className = 'active'; lyricsLines.append(line); lyricsNote.textContent = 'OPEN THE SITE THROUGH A LOCAL WEB SERVER TO LOAD LYRIC FILES.'; return; } const totalWords = rawLines.reduce((sum, line) => sum + Math.max(1, line.replace(/\[[^\]]+\]/g, '').trim().split(/\s+/).length), 0); let elapsed = 0; const duration = audio.duration || 180; syncedLyrics[track] = rawLines.map(text => { const words = Math.max(1, text.replace(/\[[^\]]+\]/g, '').trim().split(/\s+/).length); const line = { text, time: elapsed }; elapsed += duration * words / totalWords; return line; }); syncedLyrics[track].forEach(({text}) => { const line = document.createElement('p'); line.textContent = text; lyricsLines.append(line); }); lyricsNote.textContent = 'LINE TIMING IS ESTIMATED FROM THE SUPPLIED TEXT.'; syncLyrics(); }
function syncLyrics() { const lines = syncedLyrics[current]; if (!lines) return; let active = 0; lines.forEach((line, index) => { if (audio.currentTime >= line.time) active = index; }); [...lyricsLines.children].forEach((line, index) => line.classList.toggle('active', index === active)); }
function load(index, shouldPlay = false) { current = (index + songs.length) % songs.length; const [title, artist, src] = songs[current], next = songs[(current + 1) % songs.length]; audio.src = src; document.querySelector('#track-name').textContent = title; document.querySelector('#track-artist').textContent = artist; document.querySelector('#music-title').textContent = title; document.querySelector('#music-artist').textContent = artist; document.querySelector('#next-track').textContent = `${next[0]} — ${next[1]}`; [...list.children].forEach((el,i) => el.classList.toggle('active', i === current)); [...songRow.children].forEach((el,i) => el.classList.toggle('active', i === current)); [...songRow.children].forEach((el,i) => el.setAttribute('aria-pressed', String(i === current))); document.querySelector('#record-number').textContent = String(current + 1).padStart(2, '0'); progress.value = 0; document.querySelector('#music-progress').value = 0; renderLyrics(); updatePlayback(); updateTime(); if (shouldPlay) startPlayback(); }
function startPlayback() { audio.play().catch(() => { updatePlayback(); document.querySelector('#playback-state').textContent = 'COULD NOT PLAY \u00b7 TRY AGAIN'; }); }
function toggle() { if (audio.paused) startPlayback(); else audio.pause(); }
function updatePlayback() {
  const playing = !audio.paused;
  musicScreen.classList.toggle('is-playing', playing);
  [play, document.querySelector('#music-toggle')].forEach(button => { button.textContent = playing ? '\u2161' : '\u25b6'; button.setAttribute('aria-label', playing ? 'Pause' : 'Play'); });
  document.querySelector('#playback-state').textContent = playing ? 'PLAYING FROM THE HEART' : 'PAUSED \u00b7 STAY A WHILE';
}
function formatTime(seconds) { return Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2,'0')}` : '0:00'; }
function updateTime() { document.querySelector('#elapsed').textContent = formatTime(audio.currentTime); document.querySelector('#duration').textContent = formatTime(audio.duration); }
audio.volume = .7;
document.querySelector('#volume').oninput = event => { audio.volume = Number(event.target.value); };
play.onclick = toggle; document.querySelector('#next').onclick = () => load(current + 1, true); document.querySelector('#previous').onclick = () => load(current - 1, true);
audio.onplay = updatePlayback; audio.onpause = updatePlayback; audio.onended = () => load(current + 1, true);
audio.onerror = () => { updatePlayback(); document.querySelector('#playback-state').textContent = 'THIS TRACK COULD NOT LOAD'; };
audio.ontimeupdate = () => { const value = audio.duration ? audio.currentTime / audio.duration * 100 : 0; progress.value = value; document.querySelector('#music-progress').value = value; updateTime(); syncLyrics(); };
audio.onloadedmetadata = () => { updateTime(); renderLyrics(); };
progress.oninput = () => { if (audio.duration) audio.currentTime = progress.value / 100 * audio.duration; };
document.querySelector('#music-progress').oninput = event => { if (audio.duration) audio.currentTime = event.target.value / 100 * audio.duration; };
const lyricsButton = document.querySelector('#lyrics-button');
function enableTilt() { if (!window.DeviceOrientationEvent) return; if (typeof DeviceOrientationEvent.requestPermission === 'function') DeviceOrientationEvent.requestPermission().then(result => { if (result === 'granted') window.addEventListener('deviceorientation', moveLyricsBubble); }).catch(() => {}); else window.addEventListener('deviceorientation', moveLyricsBubble); }
function moveLyricsBubble(event) { const x = Math.max(-8, Math.min(8, (event.gamma || 0) / 5)); const y = Math.max(-8, Math.min(8, (event.beta || 0) / 7)); lyricsButton.style.marginLeft = `${x}px`; lyricsButton.style.marginTop = `${y}px`; }
lyricsButton.onclick = () => { enableTilt(); site.classList.add('exit-left'); setTimeout(() => { site.classList.add('is-hidden'); site.classList.remove('exit-left'); musicScreen.classList.remove('is-hidden'); }, 650); };
document.querySelector('#close-music').onclick = () => { musicScreen.classList.add('is-hidden'); site.classList.add('is-hidden', 'exit-left'); requestAnimationFrame(() => { site.classList.remove('is-hidden'); requestAnimationFrame(() => site.classList.remove('exit-left')); }); };
document.querySelector('#music-toggle').onclick = toggle; document.querySelector('#music-next').onclick = () => load(current + 1, true); document.querySelector('#music-previous').onclick = () => load(current - 1, true);
document.querySelector('#about-button').onclick = () => { site.classList.add('zoom-away'); setTimeout(() => { site.classList.add('is-hidden'); site.classList.remove('zoom-away'); aboutScreen.classList.remove('is-hidden'); aboutScreen.inert = false; document.querySelector('#close-about').focus({ preventScroll:true }); }, 650); };
document.querySelector('#close-about').onclick = () => { aboutScreen.classList.add('is-hidden'); site.classList.add('is-hidden', 'returning'); requestAnimationFrame(() => { site.classList.remove('is-hidden'); requestAnimationFrame(() => { site.classList.remove('returning'); site.inert = false; document.querySelector('#about-button').focus({ preventScroll:true }); }); }); };
document.querySelector('#socials-button').onclick = () => { site.classList.add('exit-down'); setTimeout(() => { site.classList.add('is-hidden'); site.classList.remove('exit-down'); socialScreen.classList.remove('is-hidden'); }, 650); };
document.querySelector('#close-socials').onclick = () => { socialScreen.classList.add('is-hidden'); site.classList.add('is-hidden', 'exit-down'); requestAnimationFrame(() => { site.classList.remove('is-hidden'); requestAnimationFrame(() => site.classList.remove('exit-down')); }); };
const gameIntro = document.querySelector('#game-intro'), gameScreen = document.querySelector('#game-screen'), gameField = document.querySelector('#game-field'), basket = document.querySelector('#basket');
const scoreEl = document.querySelector('#current-score'), highScoreEl = document.querySelector('#high-score'), livesEl = document.querySelector('#lives'), startButton = document.querySelector('#game-start'), instructions = document.querySelector('#game-instructions');
let gameRunning = false, gamePaused = false, gameScore = 0, gameLives = 5, highScore = 0, basketX = 50, gameFrame;
try { highScore = Math.max(0, Number(localStorage.getItem('cherrilady-high-score')) || 0); } catch {}
highScoreEl.textContent = highScore;
const pauseButton = document.querySelector('#game-pause'), soundButton = document.querySelector('#game-sound');
const heldKeys = new Set();
let lastFrame = 0, spawnClock = 0, soundEnabled = true, soundContext, startingBest = 0, resumeMusic = false;
function tone(frequency, seconds) {
  if (!soundEnabled) return;
  try {
    soundContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (soundContext.state === 'suspended') soundContext.resume().catch(() => {});
    const oscillator = soundContext.createOscillator(), gain = soundContext.createGain();
    oscillator.frequency.value = frequency; oscillator.type = 'sine';
    gain.gain.setValueAtTime(.035, soundContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, soundContext.currentTime + seconds);
    oscillator.connect(gain).connect(soundContext.destination);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(); oscillator.stop(soundContext.currentTime + seconds);
  } catch {}
}
soundButton.onclick = () => { soundEnabled = !soundEnabled; soundButton.textContent = soundEnabled ? 'sound on' : 'sound off'; soundButton.setAttribute('aria-pressed', String(soundEnabled)); soundButton.setAttribute('aria-label', soundEnabled ? 'Mute game sounds' : 'Enable game sounds'); };
function positionBasket(percent) {
  const halfWidth = basket.offsetWidth / 2 / gameField.clientWidth * 100;
  basketX = Math.max(halfWidth, Math.min(100 - halfWidth, percent));
  basket.style.left = `${basketX}%`;
}
function setBasket(clientX) { const bounds = gameField.getBoundingClientRect(); positionBasket((clientX - bounds.left) / bounds.width * 100); }
function addHeart() {
  const heart = document.createElement('img'); heart.className = 'falling-heart'; heart.src = 'game assets/falling hearts.png'; heart.alt = '';
  heart.dataset.y = '-45'; heart.dataset.speed = String((gameField.clientHeight / 4.3) * (1 + Math.min(gameScore / 45, 1.5)) * (.85 + Math.random() * .3));
  heart.style.left = `${8 + Math.random() * 84}%`; heart.style.top = '-45px'; gameField.append(heart);
}
function updateStats() {
  scoreEl.textContent = gameScore; highScoreEl.textContent = highScore;
  livesEl.textContent = '\u2665 '.repeat(gameLives).trim() + ' ' + '\u2661 '.repeat(5 - gameLives).trim();
  livesEl.setAttribute('aria-label', `${gameLives} of 5 chances remaining`);
  document.querySelector('#round-label').textContent = gameScore < 10 ? 'a gentle beginning' : gameScore < 25 ? 'a little heart shower' : 'a sky full of love';
}
function showGameMessage(kicker, title, copy) {
  document.querySelector('#result-kicker').textContent = kicker;
  document.querySelector('#result-title').textContent = title;
  document.querySelector('#result-copy').textContent = copy;
  instructions.hidden = false;
}
function finishGame() {
  gameRunning = false; gamePaused = false; cancelAnimationFrame(gameFrame); heldKeys.clear();
  pauseButton.disabled = true; startButton.disabled = false; startButton.textContent = 'play again \u2197';
  showGameMessage(gameScore > startingBest ? 'A NEW PERSONAL BEST' : 'SEALED WITH LOVE', gameScore ? 'a lovely little collection.' : 'another little chance?', `you caught ${gameScore} heart${gameScore === 1 ? '' : 's'}. ${gameScore > startingBest ? 'your best collection yet!' : 'there is always more love to catch.'}`);
  updateStats(); tone(330, .25);
}
function catchFeedback(heart) {
  const pop = document.createElement('span'); pop.className = 'catch-pop'; pop.textContent = '+1'; pop.style.left = heart.style.left; pop.style.top = `${gameField.clientHeight - 115}px`; gameField.append(pop); setTimeout(() => pop.remove(), 650);
}
function gameLoop(time) {
  if (!gameRunning || gamePaused) return;
  const delta = lastFrame ? Math.min((time - lastFrame) / 1000, .04) : 0; lastFrame = time;
  const direction = Number(heldKeys.has('ArrowRight') || heldKeys.has('d')) - Number(heldKeys.has('ArrowLeft') || heldKeys.has('a'));
  if (direction) positionBasket(basketX + direction * delta * 90);
  spawnClock += delta;
  if (spawnClock >= Math.max(.32, .9 - gameScore * .012)) { addHeart(); spawnClock = 0; }
  const basketBounds = basket.getBoundingClientRect();
  for (const heart of gameField.querySelectorAll('.falling-heart')) {
    const y = Number(heart.dataset.y) + Number(heart.dataset.speed) * delta; heart.dataset.y = String(y); heart.style.top = `${y}px`;
    const rect = heart.getBoundingClientRect();
    const caught = rect.bottom >= basketBounds.top + 15 && rect.top <= basketBounds.bottom - 18 && rect.right >= basketBounds.left + 10 && rect.left <= basketBounds.right - 10;
    if (caught) {
      gameScore++; catchFeedback(heart); heart.remove(); tone(560 + gameScore % 5 * 65, .09);
      if (gameScore > highScore) { highScore = gameScore; try { localStorage.setItem('cherrilady-high-score', String(highScore)); } catch {} }
      updateStats();
    } else if (y > gameField.clientHeight) {
      gameLives = Math.max(0, gameLives - 1); heart.remove(); updateStats(); tone(190, .13);
      gameField.classList.add('missed'); setTimeout(() => gameField.classList.remove('missed'), 200);
      if (!gameLives) { finishGame(); break; }
    }
  }
  if (gameRunning && !gamePaused) gameFrame = requestAnimationFrame(gameLoop);
}
function startGame() {
  cancelAnimationFrame(gameFrame); gameField.querySelectorAll('.falling-heart,.catch-pop').forEach(el => el.remove());
  gameScore = 0; gameLives = 5; startingBest = highScore; gamePaused = false; gameRunning = true; lastFrame = 0; spawnClock = .5; heldKeys.clear(); positionBasket(50);
  updateStats(); instructions.hidden = true; startButton.disabled = true; pauseButton.disabled = false; pauseButton.textContent = 'pause \u2161';
  gameField.inert = false; gameScreen.inert = false; gameField.focus({ preventScroll:true });
  gameFrame = requestAnimationFrame(gameLoop);
}
function pauseGame() {
  if (!gameRunning) return;
  gamePaused = !gamePaused; heldKeys.clear();
  pauseButton.textContent = gamePaused ? 'resume \u25b6' : 'pause \u2161';
  if (gamePaused) { cancelAnimationFrame(gameFrame); showGameMessage('A LITTLE BREATHER', 'take your time.', 'your hearts will be waiting. press resume or P when you are ready.'); }
  else { instructions.hidden = true; lastFrame = 0; gameField.focus({ preventScroll:true }); gameFrame = requestAnimationFrame(gameLoop); }
}
pauseButton.onclick = pauseGame;
document.querySelector('#games-button').onclick = () => { site.classList.add('exit-up'); setTimeout(() => { site.classList.add('is-hidden'); site.classList.remove('exit-up'); gameIntro.classList.remove('is-hidden'); gameIntro.inert = false; document.querySelector('#game-launch').focus({ preventScroll:true }); }, 650); };
function returnToLanding() {
  gameRunning = false; gamePaused = false; cancelAnimationFrame(gameFrame); heldKeys.clear();
  gameIntro.classList.add('is-hidden'); gameScreen.classList.add('is-hidden'); site.classList.add('is-hidden', 'exit-up');
  requestAnimationFrame(() => { site.classList.remove('is-hidden'); site.inert = false; requestAnimationFrame(() => { site.classList.remove('exit-up'); document.querySelector('#games-button').focus({ preventScroll:true }); }); });
  if (resumeMusic) { resumeMusic = false; startPlayback(); }
}
document.querySelector('#close-intro').onclick = returnToLanding;
document.querySelector('#game-launch').onclick = () => { resumeMusic = !audio.paused; audio.pause(); tone(660, .1); gameIntro.classList.add('is-hidden'); gameScreen.classList.remove('is-hidden'); requestAnimationFrame(startGame); };
document.querySelector('#close-game').onclick = returnToLanding;
startButton.onclick = startGame;
gameField.addEventListener('pointermove', event => { if (gameRunning && !gamePaused) setBasket(event.clientX); });
gameField.addEventListener('pointerdown', event => { if (gameRunning && !gamePaused) { setBasket(event.clientX); gameField.setPointerCapture(event.pointerId); gameField.focus({ preventScroll:true }); } });
document.addEventListener('keydown', event => {
  if (gameScreen.classList.contains('is-hidden')) return;
  if (['ArrowLeft','ArrowRight','a','d'].includes(event.key)) { event.preventDefault(); if (!gamePaused) heldKeys.add(event.key); }
  if (event.key.toLowerCase() === 'p' && !event.repeat) { event.preventDefault(); pauseGame(); }
  if (event.key === 'Escape') { event.preventDefault(); if (gameRunning && !gamePaused) pauseGame(); else returnToLanding(); }
});
document.addEventListener('keyup', event => heldKeys.delete(event.key));
window.addEventListener('blur', () => { heldKeys.clear(); if (gameRunning && !gamePaused) pauseGame(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && gameRunning && !gamePaused) pauseGame(); });
load(0);

// Keep keyboard navigation within the screen that is currently visible.
const screenObserver = new MutationObserver(() => {
  document.querySelectorAll('#app > section').forEach(screen => { screen.inert = screen.classList.contains('is-hidden'); });
});
document.querySelectorAll('#app > section').forEach(screen => { screen.inert = screen.classList.contains('is-hidden'); screenObserver.observe(screen, { attributes:true, attributeFilter:['class'] }); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !musicScreen.classList.contains('is-hidden')) { document.querySelector('#close-music').click(); lyricsButton.focus(); } });

document.addEventListener('keydown', event => { if (event.key !== 'Escape') return; if (!aboutScreen.classList.contains('is-hidden')) document.querySelector('#close-about').click(); else if (!gameIntro.classList.contains('is-hidden')) returnToLanding(); });
