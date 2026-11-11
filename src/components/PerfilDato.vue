<template>
  <q-item>
    <q-item-section>
      <q-item-label caption>{{ label }}</q-item-label>
      <q-item-label>{{ value || '—' }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: null },
})
</script>
