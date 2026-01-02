<script setup>
import { useAppStore } from "@/store/appstore";
import Loader from "./components/loader.vue";
import Home from '@/components/home.vue';
import Data from '@/components/data.vue';
import Final from '@/components/final.vue';
import Bg from '@/components/bg.vue';
import { onMounted } from "vue";
const appStore = useAppStore();
appStore.isLoading = true;
onMounted(() => {
  appStore.sendAnalyticsData('pageview');
});
</script>

<template>
  <Loader v-if="appStore.isLoading" />
  <Bg />

  <!-- Home screen with fade transition -->
  <Transition
    enter-active-class="transition-opacity duration-500"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-500"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <Home v-if="appStore.showhome" />
  </Transition>

  <!-- Data (form) screen with fade transition -->
  <Transition
    enter-active-class="transition-opacity duration-500"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-500"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <Data v-if="appStore.showdata" />
  </Transition>

  <!-- Final (congrats) screen with fade transition -->
  <Transition
    enter-active-class="transition-opacity duration-500"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-500"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <Final v-if="appStore.showfinal" />
  </Transition>
</template>

<style scoped></style>
