<script setup lang="ts">
import { useAppStore } from '@/store/appstore'

const appStore = useAppStore()

const handleEnter = () => {
  appStore.showhome = false
  // Wait for the home fade-out transition to finish before showing the data screen
  setTimeout(() => {
    appStore.showdata = true
  }, 500) // matches the 500ms transition duration in App.vue
  appStore.sendAnalyticsData('startbtn')
}
</script>

<template>
  <!-- Full-screen content overlay that sits on top of the existing background -->
  <div class="fixed inset-0 flex flex-col text-white pointer-events-none">

    <!-- Center content -->
    <div class="flex-1 flex items-center px-8 pointer-events-auto">
      <div class="max-w-xs">
        <p class="font-serif font-light text-[38px] leading-[42px]">
          LA28<br />
          EMPLOYEE<br />
          RAFFLE
        </p>

        <p class="mt-4 font-sans font-medium text-[16px] leading-[20px] max-w-xs">
          START YOUR RAFFLE TICKET ENTRY<br />
          BY HITTING ENTER.
        </p>


        <!-- "Enter" button -->
        <button
          type="button"
          class="mt-8 inline-flex items-center justify-center rounded-full bg-white text-[13px] tracking-wide text-gray-900 px-10 py-2 shadow-md font-sans"
          @click="handleEnter"
        >
          ENTER
        </button>
      </div>
    </div>

    <!-- Bottom fine print -->
    <div class="px-8 pb-6 text-[10px] leading-snug text-white/80 pointer-events-auto font-sans">
      Only entries submitted using your work <br />hospital email address will be eligible to win.<br />
      Only 1 submission per person.
    </div>
  </div>
</template>
