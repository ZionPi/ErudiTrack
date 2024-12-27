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
  padding: 0;
  margin: 0;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
</style>