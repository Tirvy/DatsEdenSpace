<template>
  <v-card> 
    <v-card-title>
      Направления, которые надо протестить ({{ progress }})
    </v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item v-for="destination in destinations">
          {{ destination }} {{ planetsCleanHashed[destination] ? '🟢' : '🔴' }}
          <v-list-item-action>
            <v-btn @click="startFromHere(destination)">Start from here</v-btn> 
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>

const props = defineProps<{
  planetsHashed: {[name: string]: Planet},
  planetsCleanHashed: {[name: string]: boolean}
}>();

const emit = defineEmits(['startFromHere']);

function startFromHere(destination: string) {
  emit('startFromHere', destination);
}

const planetsList = computed(() => {
  return Object.values(props.planetsHashed);
});

const progress = computed(() => {
  return `${Object.values(props.planetsCleanHashed).length} / ${planetsList.value.length}`
});

const firstPlanet = 'Eden';
const destinations = computed(() => {
  const destinations: string[] = [];
  interateRoute(firstPlanet, destinations);
  return destinations.slice(1);
})

function interateRoute(planetName: string, destinations: string[]) {
  destinations.push(planetName);

  const planet = props.planetsHashed[planetName];

  planet?.routes.forEach(route => {
    const routeTo = route.to;
    if (destinations.includes(routeTo)) {
      return;
    }
    interateRoute(routeTo, destinations)
  })
}

</script>

<style scoped></style>