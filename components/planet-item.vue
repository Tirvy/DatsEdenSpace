<template>
  <v-card style="width: 300px;">
    <v-card-title :style="props.planet.active ? 'background: green' : ''" class="bg-yellow-lighten-4">
      {{ props.planet.name }}
    </v-card-title>
    <v-card-actions>
      <v-list dense>
        <v-list-item v-for="route in props.planet.routes">
          {{ route.to }}: {{ route.cost }}
        </v-list-item>
      </v-list>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
const props = defineProps<{
  planet: {
    name: string,
    routes: {
      to: string,
      cost: number,
    }[],
    garbage: number,
    active: boolean,
  },
}>();

</script>

<style scoped></style>