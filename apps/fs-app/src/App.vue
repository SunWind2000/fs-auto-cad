<template>
  <HelloWorld />
  <div>{{ message }}</div>
  <div>{{ messageCore }}</div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import HelloWorld from "@/components/HelloWorld.vue";
import { t } from "@fs/shared";
import { t as tCore } from "@fs/core";

const message = ref(t());
const messageCore = ref(tCore());
</script>

