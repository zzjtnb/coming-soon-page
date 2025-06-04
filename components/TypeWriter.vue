<template>
  <p v-for="(item, idx) in textArr" :key="idx">{{ item }}<span class="blank" :style="aniStyle" v-if="currentTextArrayIndex === idx">|</span></p>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted} from 'vue'

const props = defineProps({
  text: String,
  texts: {
    type: Array as () => string[],
    default: () => [],
  },
  wspeed: {
    type: Number,
    default: 200,
  },
  isBack: {
    type: Boolean,
    default: false,
  },
})

const getInitialLocalTexts = (): string[] => {
  if (props.texts && props.texts.length > 0) {
    return [...props.texts]
  }
  if (props.text) {
    return [props.text]
  }
  return []
}

const localTexts = ref<string[]>(getInitialLocalTexts())
const textArr = ref<string[]>(Array(localTexts.value.length).fill(''))
const outputText = ref('') // Kept for internal logic, though not directly in template
const currentTextCount = ref(1)
const currentTextArrayIndex = ref(0)
const timer = ref<ReturnType<typeof setInterval> | undefined>(undefined)
const logPrefix = 'typewriter[log]: '
const forwardFlag = ref(true)

const aniStyle = computed(() => ({
  'animation-duration': `${props.wspeed / 1000}s`,
}))

const argumentJudge = (): boolean => {
  if (props.wspeed == null) {
    console.log(logPrefix + '未设置打印速度')
    return false
  }
  if (props.wspeed <= 0) {
    console.log(logPrefix + '速度参数不对')
    return false
  }
  if (!props.text && (!props.texts || props.texts.length === 0)) {
    console.log(logPrefix + 'no string can writer')
    return false
  }
  return true
}

const forwardWriter = () => {
  if (timer.value) clearInterval(timer.value) // Clear previous timer before starting new logic path
  timer.value = undefined

  if (currentTextArrayIndex.value >= localTexts.value.length) {
    if (props.isBack) {
      currentTextArrayIndex.value = 0
      currentTextCount.value = 1
      textArr.value = Array(localTexts.value.length).fill('') // Reset for new loop
      // Fall through to start typing forward for the first string
    } else {
      timer.value = setTimeout(() => {
        currentTextArrayIndex.value = 0
        currentTextCount.value = 1
        textArr.value = Array(localTexts.value.length).fill('')
        if (argumentJudge()) {
          timer.value = setInterval(forwardWriter, props.wspeed)
        }
      }, 5 * 1000) // 5-second overall restart delay
      return
    }
  }

  if (forwardFlag.value) {
    const item = localTexts.value[currentTextArrayIndex.value]
    if (currentTextCount.value <= item.length) {
      const tt = item.substring(0, currentTextCount.value)
      outputText.value = tt
      textArr.value[currentTextArrayIndex.value] = tt
      currentTextCount.value++
      timer.value = setInterval(forwardWriter, props.wspeed) // Continue typing this string
    } else {
      // String finished typing forward
      timer.value = setTimeout(() => {
        if (props.isBack) {
          forwardFlag.value = false
          timer.value = setInterval(backWriter, props.wspeed / 2.5)
        } else {
          currentTextArrayIndex.value++
          currentTextCount.value = 1
          if (currentTextArrayIndex.value < localTexts.value.length) {
            timer.value = setInterval(forwardWriter, props.wspeed)
          } else {
            // All strings typed, trigger overall completion/restart logic
            forwardWriter()
          }
        }
      }, 500) // 0.5-second delay
    }
  } else {
    // forwardFlag is false, meaning we should be backspacing
    if (props.isBack) {
      timer.value = setInterval(backWriter, props.wspeed / 2.5)
    } else {
      // This case should ideally not be reached if forwardFlag is correctly managed
      // If not isBack, forwardFlag should remain true. Reset to avoid dead state.
      forwardFlag.value = true
      timer.value = setInterval(forwardWriter, props.wspeed)
    }
  }
}

const backWriter = () => {
  if (timer.value) clearInterval(timer.value)
  timer.value = undefined

  if (currentTextCount.value >= 0) {
    const item = localTexts.value[currentTextArrayIndex.value]
    outputText.value = item.substring(0, currentTextCount.value)
    textArr.value[currentTextArrayIndex.value] = outputText.value
    currentTextCount.value--
    timer.value = setInterval(backWriter, props.wspeed / 2.5) // Continue backspacing
  } else {
    // String finished backspacing
    timer.value = setTimeout(() => {
      currentTextArrayIndex.value++
      forwardFlag.value = true
      currentTextCount.value = 1
      if (currentTextArrayIndex.value < localTexts.value.length) {
        timer.value = setInterval(forwardWriter, props.wspeed)
      } else {
        // All strings processed (forward and back), trigger overall completion/restart
        forwardWriter()
      }
    }, 500) // 0.5-second delay
  }
}

const typewriter = () => {
  if (!argumentJudge()) return
  // Initial textArr setup based on potentially updated localTexts
  textArr.value = Array(localTexts.value.length).fill('')
  currentTextArrayIndex.value = 0
  currentTextCount.value = 1
  forwardFlag.value = true
  forwardWriter() // Start the process
}

onMounted(() => {
  typewriter()
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
</script>

<style scoped>
/* 光标闪烁动画 */
@keyframes Blink {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.blank {
  animation-name: Blink;
  animation-timing-function: ease-in;
  animation-iteration-count: infinite;
}
</style>
