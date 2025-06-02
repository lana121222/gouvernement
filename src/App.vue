<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="w-full min-h-screen">
    <RouterView />
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
