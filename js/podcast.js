(function () {
	var RSS_URL = window.PODCAST_RSS;
	var API_URL = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(RSS_URL);
	var feedData = null;

	var audio, progressBar, barEl, playBtn, iconPlay, iconPause;
	var currentTimeEl, durationEl, speedBtn;
	var isDragging = false;

	var SPEEDS = [1, 1.25, 1.5, 2, 0.75];
	var speedIndex = 0;

	function formatTime(sec) {
		if (!sec || !isFinite(sec)) return '0:00';
		var m = Math.floor(sec / 60);
		var s = Math.floor(sec % 60);
		return m + ':' + String(s).padStart(2, '0');
	}

	function parseTime(str) {
		var parts = str.split(':').map(Number);
		if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
		if (parts.length === 2) return parts[0] * 60 + parts[1];
		return 0;
	}

	function formatDate(str) {
		var d = new Date(str);
		return d.getFullYear() + '/' +
			String(d.getMonth() + 1).padStart(2, '0') + '/' +
			String(d.getDate()).padStart(2, '0');
	}

	function linkifyTimestamps(html) {
		return html.replace(/>([^<]*?)(\d{2}:\d{2}:\d{2})([^<]*?)</g, function (_, before, ts, after) {
			return '>' + before +
				'<a class="podcast-timestamp" data-time="' + parseTime(ts) + '">' + ts + '</a>' +
				after + '<';
		});
	}

	// ---- Player ----

	function initPlayer() {
		audio = document.getElementById('podcast-audio');
		progressBar = document.getElementById('podcast-progress');
		barEl = document.getElementById('podcast-bar');
		playBtn = document.getElementById('podcast-play-btn');
		iconPlay = playBtn.querySelector('.podcast-icon-play');
		iconPause = playBtn.querySelector('.podcast-icon-pause');
		currentTimeEl = document.getElementById('podcast-current-time');
		durationEl = document.getElementById('podcast-duration');
		speedBtn = document.getElementById('podcast-speed-btn');

		playBtn.addEventListener('click', function () {
			if (!audio.src) return;
			audio.paused ? audio.play() : audio.pause();
		});

		progressBar.addEventListener('click', seek);
		progressBar.addEventListener('mousedown', function () { isDragging = true; });
		progressBar.addEventListener('touchstart', function () { isDragging = true; }, { passive: true });
		document.addEventListener('mousemove', function (e) { if (isDragging) seek(e); });
		document.addEventListener('touchmove', function (e) { if (isDragging) seek(e); }, { passive: true });
		document.addEventListener('mouseup', function () { isDragging = false; });
		document.addEventListener('touchend', function () { isDragging = false; });

		document.getElementById('podcast-backward-btn').addEventListener('click', function () {
			audio.currentTime = Math.max(0, audio.currentTime - 15);
		});

		speedBtn.addEventListener('click', function () {
			speedIndex = (speedIndex + 1) % SPEEDS.length;
			audio.playbackRate = SPEEDS[speedIndex];
			speedBtn.textContent = SPEEDS[speedIndex] + 'x';
		});

		audio.addEventListener('timeupdate', updateProgress);
		audio.addEventListener('loadedmetadata', function () {
			durationEl.textContent = formatTime(audio.duration);
		});
		audio.addEventListener('play', function () {
			iconPlay.style.display = 'none';
			iconPause.style.display = '';
		});
		audio.addEventListener('pause', function () {
			iconPlay.style.display = '';
			iconPause.style.display = 'none';
		});

		document.getElementById('podcast-detail-description').addEventListener('click', function (e) {
			var ts = e.target.closest('.podcast-timestamp');
			if (ts && audio) {
				audio.currentTime = Number(ts.dataset.time);
				audio.play();
			}
		});
	}

	function seek(e) {
		var rect = progressBar.getBoundingClientRect();
		var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
		var pct = Math.max(0, Math.min(1, x / rect.width));
		audio.currentTime = pct * audio.duration;
	}

	function updateProgress() {
		if (isDragging || !audio.duration) return;
		barEl.style.width = (audio.currentTime / audio.duration * 100) + '%';
		currentTimeEl.textContent = formatTime(audio.currentTime);
	}

	// ---- Data & Rendering ----

	function loadFeed() {
		fetch(API_URL)
			.then(function (r) { return r.json(); })
			.then(function (data) {
				feedData = data;
				// bindChannelInfo(data.feed);
				bindList(data.items);
				document.getElementById('podcast-loading').style.display = 'none';
				document.getElementById('podcast-list').style.display = '';
				handleRoute();
			})
			.catch(function () {
				document.getElementById('podcast-loading').textContent = '加载失败，请稍后重试';
			});
	}

	function bindChannelInfo(feed) {
		var cover = document.getElementById('channel-cover');
		if (feed.image) {
			cover.src = feed.image;
			cover.alt = feed.title || '';
		} else {
			cover.style.display = 'none';
		}
		document.getElementById('channel-title').textContent = feed.title || '';
		document.getElementById('channel-desc').textContent = feed.description || '';
	}

	function bindList(items) {
		var listEl = document.getElementById('podcast-list');
		var tpl = document.getElementById('podcast-item-tpl');
		if (!items || items.length === 0) {
			listEl.textContent = '暂无播客内容';
			return;
		}
		for (var i = 0; i < items.length; i++) {
			var clone = tpl.content.cloneNode(true);
			var link = clone.querySelector('.blog-summary-inner-container');
			link.href = '#/episode/' + i;

			clone.querySelector('.blog-summary-title').textContent = items[i].title || '';

			var dateEl = clone.querySelector('.blog-summary-date');
			dateEl.textContent = items[i].pubDate ? formatDate(items[i].pubDate) : '';

			var durEl = clone.querySelector('.podcast-episode-duration');
			var dur = items[i].enclosure && items[i].enclosure.duration;
			durEl.textContent = dur || '';
			if (!dur) durEl.style.display = 'none';

			var prefaceEl = clone.querySelector('.blog-summary-preface');
			var excerpt = items[i].description
				? items[i].description.replace(/<[^>]*>/g, '').substring(0, 80)
				: '';
			prefaceEl.textContent = excerpt || '';
			if (!excerpt) prefaceEl.style.display = 'none';

			listEl.appendChild(clone);
		}
	}

	function showDetail(index) {
		if (!feedData || !feedData.items[index]) return;
		var item = feedData.items[index];

		document.getElementById('podcast-list').style.display = 'none';
		// document.querySelector('.podcast-header').style.display = 'none';
		document.getElementById('podcast-detail').style.display = '';

		document.getElementById('podcast-detail-title').textContent = item.title || '';
		document.getElementById('detail-date').textContent = item.pubDate ? formatDate(item.pubDate) : '';
		var dur = item.enclosure && item.enclosure.duration;
		// document.getElementById('detail-duration').textContent = dur || '';
		durationEl.textContent = dur || '0:00';

		audio.pause();
		audio.currentTime = 0;
		barEl.style.width = '0%';
		currentTimeEl.textContent = '0:00';
		speedIndex = 0;
		audio.playbackRate = 1;
		speedBtn.textContent = '1x';

		if (item.enclosure && item.enclosure.link) {
			audio.src = item.enclosure.link;
		}

		var descEl = document.getElementById('podcast-detail-description');
		descEl.innerHTML = item.description ? linkifyTimestamps(item.description) : '';

		document.getElementById('podcast-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function showList() {
		document.getElementById('podcast-list').style.display = '';
		// document.querySelector('.podcast-header').style.display = '';
		document.getElementById('podcast-detail').style.display = 'none';

		audio.pause();
		audio.src = '';
		barEl.style.width = '0%';
		currentTimeEl.textContent = '0:00';
		durationEl.textContent = '0:00';
		iconPlay.style.display = '';
		iconPause.style.display = 'none';

		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function handleRoute() {
		var hash = window.location.hash || '#/';
		var match = hash.match(/^#\/episode\/(\d+)$/);
		if (match) {
			showDetail(parseInt(match[1], 10));
		} else {
			showList();
		}
	}

	window.addEventListener('hashchange', handleRoute);

	initPlayer();
	loadFeed();
})();
