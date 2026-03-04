const VIDEO_ID = 'pmyBHUIrQic';

const cbAutoplay = document.getElementById('autoplay');
const cbLoop     = document.getElementById('loop');
const cbMute     = document.getElementById('mute');

let player;
let playerReady = false;

// YouTube IFrame Player API を読み込む
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(tag);

window.onYouTubeIframeAPIReady = function () {
  // YT.Player は内部で document.createElement('iframe') を呼び、
  // その直後に src をセットする。
  // ブラウザは src セット時点でパーミッションポリシーを評価するため、
  // 生成直後（src セット前）に allow を付与するためオーバーライドする。
  const _createElement = document.createElement.bind(document);
  document.createElement = function (tagName, options) {
    const el = _createElement(tagName, options);
    if (tagName.toLowerCase() === 'iframe') {
      el.setAttribute(
        'allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      );
      el.setAttribute('allowfullscreen', '');
    }
    return el;
  };

  player = new YT.Player('youtube-player', {
    width: '100%',
    height: '100%',
    videoId: VIDEO_ID,
    playerVars: {
      autoplay    : 0,        // 再生は onReady で API 経由に統一
      mute        : 1,        // 初期ロードはミュートで開始
      loop        : cbLoop.checked ? 1 : 0,
      playlist    : VIDEO_ID, // loop に必須
      playsinline : 1,
    },
    events: {
      onReady: onPlayerReady,
    },
  });

  // new YT.Player() は同期的に iframe を生成するので
  // ここで確実に元の createElement を復元できる
  document.createElement = _createElement;
};

function onPlayerReady(event) {
  playerReady = true;
  // Safari 向けに API 経由でミュート → 再生の順に明示的に指示
  event.target.mute();
  event.target.setLoop(cbLoop.checked);
  if (!cbMute.checked) event.target.unMute();
  if (cbAutoplay.checked) event.target.playVideo();
}

// チェックボックス変更 → API で即時反映
function applySettings() {
  if (!playerReady) return;
  cbMute.checked ? player.mute() : player.unMute();
  player.setLoop(cbLoop.checked);
  cbAutoplay.checked ? player.playVideo() : player.pauseVideo();
}

[cbAutoplay, cbLoop, cbMute].forEach((cb) => {
  cb.addEventListener('change', applySettings);
});
