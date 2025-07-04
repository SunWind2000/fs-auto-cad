<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>This is a simple Vue component.</p>
    <p>Current time: {{ currentTime }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
const msg = ref("Hello, World!");
const currentTime = ref("");
onMounted(() => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString();
});
</script>
