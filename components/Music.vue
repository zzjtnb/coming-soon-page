<script lang="ts" setup>
import {onMounted, watch, onBeforeUnmount} from 'vue'
import {useMediaControls} from '@vueuse/core'
import IconList from './IconList.vue' // 假设你把SVG组件放在 assets/icons

interface Track {
  name: string
  artist: string
  cover: string
  source: string
  url: string
  favorited: boolean
}
const showMark = ref(false)
const audio = ref<HTMLAudioElement | null>(null)
const progress = ref<HTMLElement | null>(null)

const is_mini = ref(true)
const tracks = reactive([
  {
    name: '片头',
    artist: '血色浪漫',
    cover: '/img/1.jpg',
    source: '/mp3/1.mp3',
    url: 'https://www.youtube.com/watch?v=Hx_pgqmj4Cg',
    favorited: true,
  },

  {
    name: 'Extreme Ways',
    artist: 'Moby',
    cover: '/img/2.jpg',
    source: '/mp3/2.mp3',
    url: 'https://www.youtube.com/watch?v=ICjyAe9S54c',
    favorited: false,
  },
  {
    name: 'Everybody Knows',
    artist: 'Leonard Cohen',
    cover: '/img/3.jpg',
    source: '/mp3/3.mp3',
    url: 'https://www.youtube.com/watch?v=Lin-a2lTelg',
    favorited: true,
  },
])
const currentTrack = ref<Track | null>(null)
const currentTrackIndex = ref(0)
const transitionName = ref('')

// play/pause 将由 useMediaControls 的 playing.value 控制
// generateTime 不再需要，时间格式化将通过 computed properties 实现
// updateBar 将通过 useMediaControls 的 seek 方法实现
function clickProgress(e: MouseEvent) {
  if (!progress.value || !duration.value) return
  const rect = progress.value.getBoundingClientRect()
  const percentage = (e.clientX - rect.left) / rect.width
  currentTime.value = duration.value * percentage
  if (!playing.value) {
    playing.value = true // 点击进度条后开始播放
  }
}
function prevTrack() {
  transitionName.value = 'scale-in'
  if (currentTrackIndex.value > 0) {
    currentTrackIndex.value--
  } else {
    currentTrackIndex.value = tracks.length - 1
  }
  currentTrack.value = tracks[currentTrackIndex.value]
}
function nextTrack() {
  transitionName.value = 'scale-out'
  if (currentTrackIndex.value < tracks.length - 1) {
    currentTrackIndex.value++
  } else {
    currentTrackIndex.value = 0
  }
  currentTrack.value = tracks[currentTrackIndex.value]
}
function favorite() {
  tracks[currentTrackIndex.value].favorited = !tracks[currentTrackIndex.value].favorited
}

const controls = useMediaControls(audio, {
  src: computed(() => currentTrack.value?.source || ''),
})

const {playing, currentTime, duration, volume, waiting, ended} = controls

// 格式化时间显示
const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds) || timeInSeconds === Infinity) return '00:00'
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const displayCurrentTime = computed(() => formatTime(currentTime.value))
const displayDuration = computed(() => formatTime(duration.value))

const barWidth = computed(() => {
  return duration.value ? `${(currentTime.value / duration.value) * 100}%` : '0%'
})

// 播放/暂停切换函数
function togglePlay() {
  if (!currentTrack.value) return // 如果没有当前曲目，则不执行任何操作
  playing.value = !playing.value
  if (playing.value) {
    showMark.value = false
  }
}

defineExpose({togglePlay})

function handleFirstUserClick() {
  controls.muted.value = false
  controls.playing.value = true
  document.removeEventListener('click', handleFirstUserClick)
}

onMounted(() => {
  currentTrack.value = tracks[0]
  controls.muted.value = true
  controls.playing.value = true
  // 检查是否自动播放成功
  setTimeout(() => {
    if (audio.value && audio.value.paused) {
      document.addEventListener('click', handleFirstUserClick, { once: true })
    }
  }, 200)
  // 自动播放逻辑: 等待 useMediaControls 准备好并且音轨加载完毕
  const unwatch = watch(waiting, (newWaiting, oldWaiting) => {
    if (oldWaiting === true && newWaiting === false) {
      playing.value = true
    }
  })
  unwatch()

  if (audio.value) {
    const errorHandler = (e: Event) => {
      console.error('Audio error during/after mount:', e)
      audio.value?.removeEventListener('error', errorHandler)
    }
    audio.value.addEventListener('error', errorHandler)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleFirstUserClick)
})

// onEnd 将由 useMediaControls 的 ended 状态处理
watch(ended, (isEnded) => {
  if (isEnded) {
    nextTrack()
  }
})
</script>

<template>
  <div class="music">
    <IconList class="icon" />
    <ClientOnly>
      <div class="list" @click="is_mini = !is_mini">
        <svg class="icon">
          <use xlink:href="#icon-list"></use>
        </svg>
      </div>
      <div class="wrapper">
        <audio ref="audio" loop autoplay muted>
          Your browser does not support the
          <code>audio</code> element.
        </audio>
        <transition name="player-transition">
          <div class="player" v-show="!is_mini">
            <div class="player__top">
              <div class="player-cover">
                <transition :name="transitionName" mode="out-in">
                  <div class="player-cover__item" :key="currentTrack?.cover" :style="{backgroundImage: `url(${currentTrack?.cover})`}" v-if="currentTrack?.cover"></div>
                </transition>
              </div>
              <div class="player-controls" v-if="currentTrack">
                <div class="player-controls__item -favorite" :class="{active: currentTrack?.favorited}" @click="favorite">
                  <svg class="icon">
                    <use xlink:href="#icon-heart-o"></use>
                  </svg>
                </div>
                <a :href="currentTrack?.url" target="_blank" class="player-controls__item">
                  <svg class="icon">
                    <use xlink:href="#icon-link"></use>
                  </svg>
                </a>
                <div class="player-controls__item" @click="prevTrack">
                  <svg class="icon">
                    <use xlink:href="#icon-prev"></use>
                  </svg>
                </div>
                <div class="player-controls__item" @click="nextTrack">
                  <svg class="icon">
                    <use xlink:href="#icon-next"></use>
                  </svg>
                </div>
                <div class="player-controls__item -xl js-play" @click="togglePlay()">
                  <svg class="icon">
                    <use xlink:href="#icon-pause" v-if="playing"></use>
                    <use xlink:href="#icon-play" v-else></use>
                  </svg>
                </div>
              </div>
            </div>
            <div class="progress" ref="progress">
              <div class="progress__top">
                <div class="album-info" v-if="currentTrack">
                  <div class="album-info__name">{{ currentTrack?.artist }}</div>
                  <div class="album-info__track">{{ currentTrack?.name }}</div>
                </div>
                <div class="progress__duration">{{ displayDuration }}</div>
              </div>
              <div class="progress__bar" @click="clickProgress">
                <div class="progress__current" :style="{width: barWidth}"></div>
              </div>
              <div class="progress__time">{{ displayCurrentTime }}</div>
            </div>
          </div>
        </transition>
      </div>
    </ClientOnly>
  </div>
</template>
<style scoped>
.music {
  z-index: 9;
}
.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  stroke-width: 0;
  stroke: currentColor;
  fill: currentColor;
}

.wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
@media screen and (max-width: 700px), (max-height: 500px) {
  .wrapper {
    flex-wrap: wrap;
    flex-direction: column;
  }
}

.player {
  background: #eef3f7;
  width: 410px;
  min-height: 480px;
  box-shadow: 0px 15px 35px -5px rgba(50, 88, 130, 0.32);
  border-radius: 15px;
  padding: 30px;
}
@media screen and (max-width: 576px), (max-height: 500px) {
  .player {
    width: 95%;
    padding: 20px 20px 30px;
    margin-top: 75px;
    min-height: initial;
    max-width: 400px;
  }
}
.player__top {
  display: flex;
  align-items: flex-start;
  position: relative;
  z-index: 4;
}
@media screen and (max-width: 576px), (max-height: 500px) {
  .player__top {
    flex-wrap: wrap;
  }
}
.player-cover {
  width: 300px;
  height: 300px;
  margin-left: -70px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  border-radius: 15px;
  z-index: 1; /* 确认 player-cover 的 z-index，移除了重复的 z-index: 2 */
}
@media screen and (max-width: 576px), (max-height: 500px) {
  .player-cover {
    margin-top: -70px;
    margin-bottom: 25px;
    width: 290px;
    height: 230px;
    margin-inline: auto;
  }
}
.player-cover__item {
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  width: 100%;
  height: 100%;
  border-radius: 15px;
  position: absolute;
  left: 0;
  top: 0;
}
.player-cover__item:before {
  content: '';
  background: inherit;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 1;
  position: absolute;
  top: 30px;
  transform: scale(0.9);
  filter: blur(10px);
  opacity: 0.9;
  border-radius: 15px;
}
.player-cover__item:after {
  content: '';
  background: inherit;
  width: 100%;
  height: 100%;
  box-shadow: 0px 10px 40px 0px rgba(76, 70, 124, 0.5);
  display: block;
  z-index: 2;
  position: absolute;
  border-radius: 15px;
}
.player-controls {
  flex: 1;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
@media screen and (max-width: 576px), (max-height: 500px) {
  .player-controls {
    flex-direction: row;
    padding-left: 0;
    width: 100%;
    flex: unset;
  }
}
.player-controls__item {
  display: inline-flex;
  font-size: 30px;
  padding: 5px;
  margin-bottom: 10px;
  color: #acb8cc;
  cursor: pointer;
  width: 50px;
  height: 50px;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease-in-out;
}
@media screen and (max-width: 576px), (max-height: 500px) {
  .player-controls__item {
    font-size: 26px;
    margin-right: 10px;
    width: 40px;
    height: 40px;
    margin-bottom: 0;
  }
}
.player-controls__item::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #fff;
  transform: scale(0.5);
  opacity: 0;
  box-shadow: 0px 5px 10px 0px rgba(76, 70, 124, 0.2);
  transition: all 0.3s ease-in-out;
  transition: all 0.4s cubic-bezier(0.35, 0.57, 0.13, 0.88);
}
@media screen and (min-width: 500px) {
  .player-controls__item:hover {
    color: #532ab9;
  }
  .player-controls__item:hover::before {
    opacity: 1;
    transform: scale(1.3);
  }
}
@media screen and (max-width: 576px), (max-height: 500px) {
  .player-controls__item:active {
    color: #532ab9;
  }
  .player-controls__item:active::before {
    opacity: 1;
    transform: scale(1.3);
  }
}
.player-controls__item .icon {
  position: relative;
  z-index: 2;
}
.player-controls__item.-xl {
  margin-bottom: 0;
  font-size: 95px;
  filter: drop-shadow(0 11px 6px rgba(172, 184, 204, 0.45));
  color: #fff;
  width: auto;
  height: auto;
  display: inline-flex;
}
@media screen and (max-width: 576px), (max-height: 500px) {
  .player-controls__item.-xl {
    margin-left: auto;
    font-size: 75px;
    margin-right: 0;
  }
}
.player-controls__item.-xl:before {
  display: none;
}
.player-controls__item.-favorite.active {
  color: red;
}

[v-cloak] {
  display: none;
}

[v-cloak] > * {
  display: none;
}

.progress {
  width: 100%;
  margin-top: -15px;
  user-select: none;
}
.progress__top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.progress__duration {
  color: #71829e;
  font-weight: 700;
  font-size: 20px;
  opacity: 0.5;
}
.progress__time {
  margin-top: 2px;
  color: #71829e;
  font-weight: 700;
  font-size: 16px;
  opacity: 0.7;
}

.progress__bar {
  height: 6px;
  width: 100%;
  cursor: pointer;
  background-color: #d0d8e6;
  display: inline-block;
  border-radius: 10px;
}

.progress__current {
  height: inherit;
  width: 0%;
  background-color: #a3b3ce;
  border-radius: 10px;
}

.album-info {
  color: #71829e;
  flex: 1;
  padding-right: 60px;
  user-select: none;
}
@media screen and (max-width: 576px), (max-height: 500px) {
  .album-info {
    padding-right: 30px;
  }
}
.album-info__name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
  line-height: 1.3em;
}
@media screen and (max-width: 576px), (max-height: 500px) {
  .album-info__name {
    font-size: 18px;
    margin-bottom: 9px;
  }
}
.album-info__track {
  font-weight: 400;
  font-size: 20px;
  opacity: 0.7;
  line-height: 1.3em;
  min-height: 52px;
}
@media screen and (max-width: 576px), (max-height: 500px) {
  .album-info__track {
    font-size: 18px;
    min-height: 50px;
  }
}

.github-btn {
  position: absolute;
  right: 40px;
  bottom: 50px;
  text-decoration: none;
  padding: 15px 25px;
  border-radius: 4px;
  box-shadow: 0px 4px 30px -6px rgba(36, 52, 70, 0.65);
  background: #24292e;
  color: #fff;
  font-weight: bold;
  letter-spacing: 1px;
  font-size: 16px;
  transition: all 0.3s ease-in-out;
}
@media screen and (min-width: 500px) {
  .github-btn:hover {
    transform: scale(1.1);
    box-shadow: 0px 17px 20px -6px rgba(36, 52, 70, 0.36);
  }
}
@media screen and (max-width: 700px) {
  .github-btn {
    position: relative;
    bottom: auto;
    right: auto;
    margin-top: 20px;
  }
  .github-btn:active {
    transform: scale(1.1);
    box-shadow: 0px 17px 20px -6px rgba(36, 52, 70, 0.36);
  }
}

.scale-out-enter-active {
  transition: all 0.35s ease-in-out;
}

.scale-out-leave-active {
  transition: all 0.35s ease-in-out;
}

.scale-out-enter {
  transform: scale(0.55);
  pointer-events: none;
  opacity: 0;
}

.scale-out-leave-to {
  transform: scale(1.2);
  pointer-events: none;
  opacity: 0;
}

.scale-in-enter-active {
  transition: all 0.35s ease-in-out;
}

.scale-in-leave-active {
  transition: all 0.35s ease-in-out;
}

.scale-in-enter {
  transform: scale(1.2);
  pointer-events: none;
  opacity: 0;
}

.scale-in-leave-to {
  transform: scale(0.55);
  pointer-events: none;
  opacity: 0;
}

.mark {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background: rgba(8, 8, 8, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.enter {
  width: 10rem;
  height: 3.4rem;
  color: #fff;
  font-size: 2.1rem;
  font-family: 'Ma Shan Zheng', cursive, sans-serif;
  font-weight: 400;
  letter-spacing: 2px;
  border: none;
  border-radius: 1.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 42, 62, 0.78);
  box-shadow: 0 2px 16px 0 rgba(30,42,62,0.22);
  cursor: pointer;
  transition: background 0.22s, box-shadow 0.22s, transform 0.16s, filter 0.22s;
  outline: none;
  backdrop-filter: blur(2.5px);
  text-shadow: 0 2px 12px rgba(0,0,0,0.22);
  animation: enter-pop 1.2s cubic-bezier(.68,-0.55,.27,1.55) 0.2s both, enter-glow 2.2s ease-in-out infinite alternate;
}
@keyframes enter-pop {
  0% {
    transform: scale(0.7);
    opacity: 0;
    filter: blur(2px);
  }
  60% {
    transform: scale(1.08);
    opacity: 1;
    filter: blur(0.5px);
  }
  100% {
    transform: scale(1);
    opacity: 1;
    filter: blur(0);
  }
}
@keyframes enter-glow {
  0% {
    box-shadow: 0 2px 16px 0 rgba(30,42,62,0.22), 0 0 0 0 rgba(91,134,229,0.18);
  }
  100% {
    box-shadow: 0 4px 32px 0 rgba(30,42,62,0.32), 0 0 16px 4px rgba(91,134,229,0.18);
  }
}
.enter:hover {
  background: rgba(30, 42, 62, 0.92);
  box-shadow: 0 6px 24px 0 rgba(30,42,62,0.32), 0 0 18px 2px rgba(91,134,229,0.22);
  transform: translateY(-2px) scale(1.06) rotate(-1deg);
  filter: brightness(1.08) saturate(1.1);
}
.enter:active {
  background: rgba(30, 42, 62, 0.65);
  transform: scale(0.97);
  filter: brightness(0.95);
}
.enter:focus {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
.music {
  background: #dfe7ef;
  position: relative;
}

section {
  position: relative;
}
.wrapper {
  position: absolute;
  justify-content: flex-end;
  min-height: auto;
}
.list {
  position: absolute;
  right: 1rem;
  top: 1rem;
  z-index: 9;
  cursor: pointer;
}
.list .icon {
  width: 2em;
  height: 2em;
}
@media screen and (max-width: 700px), (max-height: 500px) {
  .list {
    right: 0.2rem;
  }
}

/* 动画相关的旧代码已被清理 */
.player-transition-enter-active,
.player-transition-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.player-transition-enter-from,
.player-transition-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.player-transition-enter-to,
.player-transition-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
