<template>
  <div>
    <div @click="handleError">Clear errors</div>
    {{ error }}
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object,
});

const handleError = () => clearError({redirect: "/"});
</script>
