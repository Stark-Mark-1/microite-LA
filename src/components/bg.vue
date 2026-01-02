<script setup lang="ts">
import { useAppStore } from '@/store/appstore'
import bg from 'D:/Wavelaps/microsite/assets/bg.webp'

const appStore = useAppStore()

const handleBgLoaded = () => {
  appStore.isLoading = false
}
</script>

<template>
  <Transition
    v-show="appStore.showbg"
    enter-active-class="transition-opacity duration-500"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-500"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <img
      class="fixed scale-105 size-full"
      :src="bg"
      alt=""
      @load="handleBgLoaded"
      @error="handleBgLoaded"
    />
  </Transition>
</template>