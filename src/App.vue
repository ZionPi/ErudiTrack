<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
<style>
/* Add these styles to your App.vue's <style> block (without 'scoped') */
body {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 如果需要左对齐 */
  justify-content: flex-start;
  min-height: 100vh;
  margin: 0;
}

#app {
  width: 100%; /* Ensure the root #app element takes full width */
  display: flex;
  /* If you want content to align to the start instead of center, use: */
  /* justify-content: flex-start; */
  justify-content: center; /* Keep centering if desired */
  align-items: center;
  min-height: 100vh;
}

/* Ensure router-view takes full width */
#app > * {
  width: 100%;
}
</style>