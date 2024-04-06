<template>
  <v-card> 
    <v-card-title>
      Направления, которые надо протестить
    </v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item v-for="destination in destinations">
          {{ destination }} {{ planetsCleanHashed[destination] ? '🟢' : '🔴' }}
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

const planetsList = computed(() => {
  return Object.values(props.planetsHashed);
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