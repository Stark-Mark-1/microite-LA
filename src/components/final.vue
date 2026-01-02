<script setup lang="ts">
import { useAppStore } from '@/store/appstore'

const appStore = useAppStore()
</script>

<template>
  <!-- Full-screen content overlay that sits on top of the existing background -->
  <div class="fixed inset-0 flex flex-col text-white pointer-events-none">
    <!-- Centered content -->
    <div class="flex-1 flex items-center justify-center px-8 py-10 pointer-events-auto">
      <div class="max-w-xs text-center">
        <p class="text-3xl md:text-4xl font-serif font-bold leading-tight mb-2">
          CONGRATULATIONS!
        </p>
        <p class="text-sm md:text-base font-sans font-semibold tracking-wide mb-4 text-left">
          YOU'VE BEEN ENTERED TO WIN.
        </p>
        <p class="text-xs md:text-sm font-sans leading-relaxed text-white/90 max-w-xs mx-auto text-left">
          Winners will be selected and notified post-event.
        </p>
      </div>
    </div>
  </div>
</template>


