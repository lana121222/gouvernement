<script setup lang="ts">
import { RouterView } from 'vue-router'
import NotificationContainer from '@/components/NotificationContainer.vue'
</script>

<template>
  <div class="w-full min-h-screen">
    <RouterView />
    <NotificationContainer />
  </div>
</template>

<style>
/* Styles globaux pour forcer l'affichage desktop */
html, body {
  width: 100%;
  margin: 0;
  padding: 0;
}

#app {
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>
