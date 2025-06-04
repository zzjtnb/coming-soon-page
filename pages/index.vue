<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import dayjs from 'dayjs';

const targetDate = dayjs("2024-12-06");
const diffTime = ref<number | null>(null);
let timer: any = null;

const updateDiffTime = () => {
  diffTime.value = targetDate.diff(dayjs(), "seconds");
};

onMounted(() => {
  updateDiffTime(); // Calculate initial difference on client
  timer = setInterval(() => {
    updateDiffTime();
    // Timer will now continue indefinitely, diffTime will become negative
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

const durationLabels = ["days", "hours", "minutes", "seconds"];

const durationFormatter = computed(() => {
  if (diffTime.value === null) { // Only for initial uncalculated state
    return durationLabels.map(label => ({ time: '00', label }));
  }

  const isNegative = diffTime.value < 0;
  let t = Math.abs(diffTime.value);

  const s = t % 60;
  t = Math.floor(t / 60);
  const m = t % 60;
  t = Math.floor(t / 60);
  const h = t % 24;
  t = Math.floor(t / 24);
  const d = t;

  const values = [d, h, m, s];
  const times = values.map(val => {
    const formatted = val < 10 ? `0${val}` : `${val}`;
    // If original diffTime is negative, prefix with '-'
    // This will result in e.g., "-00", "-01", etc.
    return isNegative ? `-${formatted}` : formatted;
  });

  return durationLabels.map((label, index) => ({ time: times[index], label }));
});


</script>

<template>
  <div class="index zzjtnb">
    <header><h1>Coming Soon</h1></header>
    <div class="main-content-agile">
      <div class="w3l-agile">
        <h2 class="">We are on the way</h2>
      </div>
      <div class="examples">
        <div class="simply-countdown-losange">
          <div class="simply-section" v-for="item in durationFormatter" :key="item.label">
            <span class="simply-amount"> {{ item.time }} </span>
            <span class="simply-word">{{ item.label }}</span>
          </div>
        </div>
      </div>
      <div class="news">
        <TypeWriter :texts="['这个世界上没有什么东西是永远属于你的,但有一个东西例外,那就是本领,谁也抢不走.', '一个浪迹天涯的游子回到故乡的时候,发现的第一件事总是自己的恋人变成别人的老婆.']"  :wspeed="200"/>
      </div>
    </div>
    <footer class="footer">
      <p>
        Copyright &copy; 2019.zzjtnb All rights reserved.
        <a target="_blank" href="https://zzjtnb.com">Website HomePage</a>
      </p>
    </footer>
  </div>
</template>
<style>
@import url("https://fonts.googleapis.com/css?family=Roboto+Condensed:300,300i,400,400i,700,700i");
@import url("https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap");
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.zzjtnb {
  height: 100vh;
  background: url("/img/bg.jpg") no-repeat;
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
  font-family: 'Roboto Condensed', Arial, Helvetica, sans-serif;
  overflow: hidden;
  color: #fff;
}

h1 {
  font-size: 4vw;
  letter-spacing: 4px;
  text-align: center;
  margin: 1.5vw 2vw 4vw;
  text-shadow: 1px 1px 2px #000;
  font-weight: 600;
}

.w3l-agile {
  text-align: center;
  margin-bottom: 2vw; /* 增加底部间距 */
}

h2 {
  font-size: 3vw;
  letter-spacing: 1px;
  font-weight: 400;
}

.examples {
  display: flex;
  align-items: center;
  justify-content: center;
}

.simply-countdown-losange {
  max-width: 800px;
  margin: 0 5vw;
  box-sizing: border-box;
  display: -webkit-flex;
  display: -webkit-box;
  display: -moz-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-justify-content: space-between;
  justify-content: space-between;
  flex-wrap: wrap;
  flex-basis: 100%;
}
@media (min-width: 1920px) {
  .simply-countdown-losange {
    max-width: 54vw;
  }
}
.simply-section {
  flex-basis: 24%;
  box-sizing: border-box;
  text-align: center;
  border: 2px solid rgba(255, 255, 255, 0.52);
  padding: 2vw;
  border-radius: 4px;
}

.simply-amount {
  font-size: 60px;
}

.simply-word {
  font-size: 18px;
  letter-spacing: 2px;
  margin-left: 5px;
  color: #55d45a;
  display: block;
  text-transform: capitalize;
  margin-top: 15%;
}

.footer {
  margin: 2vw 0.3vw 2vw;
}

.footer p {
  font-size: 1rem;
  letter-spacing: 2px;
  text-align: center;
  line-height: 1.8;
}

.footer p a {
  color: #55d45a;
  transition: 0.5s all;
}

.footer p a:hover {
  color: #fff;
  transition: 0.5s all;
}

.news {
  font-family: "Ma Shan Zheng", cursive;
  color: springgreen;
  line-height: 2rem;
  font-size: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: left;
  margin-top: 2rem;
}

.news p {
  margin: 2rem 0;
}

@media (max-width: 1080px) {
  .news {
    text-align: center;
  }
}

@media (max-width: 1920px) {
  h1 {
    font-size: 4vw;
  }
}

@media (max-width: 1080px) {
  h1 {
    font-size: 5vw;
  }
}

@media (max-width: 800px) {
  h1 {
    font-size: 3em;
    margin: 3vw 2vw 5vw;
  }

  .simply-amount {
    font-size: 56px;
  }


  h2 {
    font-size: 2em;
  }
}

@media (max-width: 600px) {
  span.simply-amount {
    font-size: 50px;
  }

  span.simply-word {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 2.5em;
    letter-spacing: 2px;
    margin: 6vh 2vw 7vw;
  }

  h2 {
    font-size: 1.8em;
  }

  .w3l-agile p {
    /* font-size: 0.8vw; */
    font-size: 0.8rem;
  }

  span.simply-amount {
    font-size: 40px;
  }

  span.simply-word {
    font-size: 15px;
    letter-spacing: 1px;
  }
}

@media (max-width: 384px) {
  span.simply-amount {
    font-size: 35px;
  }

  span.simply-word {
    font-size: 14px;
  }

  .footer p {
    letter-spacing: 2px;
  }
}

@media (max-width: 320px) {
  h1 {
    font-size: 2.2em;
    letter-spacing: 1px;
  }

  h2 {
    font-size: 1.5em;
  }

  .w3l-agile p {
    font-size: 0.6vw;
  }

  .simply-section {
    flex-basis: 48%;
  }

  .simply-section:nth-child(3),
  .simply-section:nth-child(4) {
    margin-top: 1em;
  }

  .form-style-agile input[type="email"] {
    font-size: 13px;
    flex-basis: 70%;
  }

  .sub-main-w3 input[type="submit"] {
    padding: 13px 0;
    flex-basis: 30%;
    font-size: 14px;
  }

  .sub-main-w3 p {
    font-size: 17px;
  }

  .sub-main-w3 form {
    margin: 11vw 4vw;
  }
}

.news {
  font-family: "Ma Shan Zheng", cursive;
  color: springgreen;
  line-height: 2rem;
  font-size: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: left;
  margin-top: 2rem;

}
.news p {
  margin: 2rem 0;
}
@media (max-width: 1080px) {
  .news {
    text-align: center;
  }
}

/*-- //responsive --*/
</style>
