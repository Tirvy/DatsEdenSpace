<template>
  <v-card style="width: 300px;">
    <v-card-title class="bg-green-lighten-4">
      Мы на планете: {{ props.activePlanet.name }}
    </v-card-title>
    <v-card-actions>
      <v-list dense class="w-100">
        <v-list-subheader>
          Куда летим?
        </v-list-subheader>
        <v-list-item v-for="route in props.activePlanet.routes" class="w-100">
          {{ route.to }}: {{ route.cost }}
          <template v-slot:append>
            <v-btn color="grey-darken-2" variant="text" @click="travelTo(route.to)">go</v-btn>
          </template>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item>
          <v-list-item-title>
            Eden
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ routeToEden }}
          </v-list-item-subtitle>
          <v-list-item-action>
            <v-btn color="grey-darken-2" variant="text" @click="travelToEden()">go</v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-subheader class="w-100">
          Построить маршрут
        </v-list-subheader>
        <v-list-item>
          <v-text-field label="Куда?" v-model="routeTo" class="w-100"></v-text-field>
          <v-list-item-action>
            <v-btn color="grey-darken-2" variant="text" @click="addRoute(routeTo)">generate</v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-list-item v-if="newRoute.length">
          {{ newRoute }}
          <v-list-item-action>
            <v-btn color="grey-darken-2" variant="text" @click="goRoute()">go</v-btn>
          </v-list-item-action>
        </v-list-item>

      </v-list>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>

import type { Planet } from '~/types/index';
import Graph from '~/utils/graph';

const props = defineProps<{
  activePlanet: Planet,
  universe: any,
}>();

const emit=defineEmits(['travel'])

const routeTo = ref('');



const planetsHashed = computed(() => {
  return props.universe.reduce((total: { [name: string]: Planet }, item: any[]) => {
    const from = item[0];
    const to = item[1];
    const cost = item[2];
    if (!total[from]) {
      total[from] = {
        name: from,
        routes: [],
        isClean: false,
      }
    }

    total[from].routes.push({
      to,
      cost,
    })
    return total;
  }, {});
});

const planetsList = computed(() => {
  return Object.values(planetsHashed.value);
});

const planetNames = computed(() => {
  return Object.keys(planetsHashed.value);
})

const map = computed(() => {
  return planetsList.value.reduce((total: { [from: string]: { [to: string]: number } }, item: any) => {

    total[item.name] = item.routes.reduce((total: any, route: any) => {
      total[route.to] = route.cost;
      return total;
    }, {});
    return total;
  }, {})
})

const newRoute: Ref<string[]> = ref([]);


function addRoute(routeTo: string) {
  if (!planetsHashed.value[routeTo]) {
    console.log('11');
    return
  }

  newRoute.value = useGraph('route', [props.activePlanet.name, routeTo]) as string[];
}

const routeToEden = computed(() => {
  return useGraph('route', [props.activePlanet.name, 'Eden']) as string[];
});

function goRoute() {
  emit('travel', newRoute.value);
}

async function travelTo(planetName: string) {
  emit('travel', [planetName]);
}

async function travelToEden() {
  emit('travel', routeToEden.value);
}


</script>

<style scoped></style>