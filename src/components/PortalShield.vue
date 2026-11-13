<template>
  <!-- Municipal shield ("MPP"), drawn inline so it needs no asset. -->
  <svg :width="width" :height="height" viewBox="0 0 40 46" aria-hidden="true" focusable="false">
    <path d="M20 2 4 7v14c0 11 7 19 16 23 9-4 16-12 16-23V7z" fill="#ffffff" />
    <path
      d="M20 6.5 8 10.3V21c0 8.6 5.3 14.8 12 18 6.7-3.2 12-9.4 12-18V10.3z"
      fill="none"
      stroke="#004173"
      stroke-width="1.5"
    />
    <text
      x="20"
      y="27"
      text-anchor="middle"
      font-size="11"
      font-weight="800"
      fill="#004173"
      font-family="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    >
      MPP
    </text>
  </svg>
</template>

<script setup>
defineProps({
  width: { type: [Number, String], default: 40 },
  height: { type: [Number, String], default: 46 },
})
</script>
