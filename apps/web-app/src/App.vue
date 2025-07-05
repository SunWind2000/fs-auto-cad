<template>
  <HelloWorld />
  <div>{{ messageCore }}</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import HelloWorld from "@web-app/components/HelloWorld.vue";
import { t as tCore } from "@fs/core";

const messageCore = ref(tCore());
</script>

