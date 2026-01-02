<script setup="ts">
const modelValue = defineModel({ type: Boolean, default: false })
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-white/80 flex items-center justify-center z-[9999]"
  >
    <div
      class="w-16 h-16 border-8 border-gray-200 border-t-blue-500 rounded-full animate-spin"
    ></div>
  </div>
</template>
