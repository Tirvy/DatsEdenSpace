<template>
  <v-app id="inspire">
    <v-app-bar dense>
      <template v-slot:prepend>
        <v-avatar color="yellow">Ё</v-avatar>
      </template>
      <v-row>
        <v-col>
          <v-btn @click="fetchUniverse">обновить</v-btn>
        </v-col>
      </v-row>
      <div><v-btn @click="startAutoRouter(0)">start auto</v-btn></div>
      <v-spacer></v-spacer>

      <div><v-btn @click="stopAutoRouter">stop auto</v-btn></div>
      <div>DatsEdenSpace</div>
      <div><v-btn class="color-red" @click="reset">RESET</v-btn></div>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row v-if="activePlanet">
          <v-col>
            <space-navigation :activePlanet="activePlanet" :universe="universe" @travel="travelTo"></space-navigation>
          </v-col>
          <v-col>
            <v-card>
              <v-card-title class="bg-green-lighten-4">
                Корабль
              </v-card-title>
              <v-card-text>
                <v-list density="compact" nav>
                  <v-list-item>
                    Топлива потрачено: {{ ship.fuelUsed }}
                  </v-list-item>
                  <v-list-item>
                    Размер трюма: {{ ship.capacityX }}x{{ ship.capacityY }}/{{ ship.capacityX * ship.capacityY }}
                  </v-list-item>
                  <v-list-item>
                    Масса в трюме: {{ garbageMass }}
                  </v-list-item>
                  <v-list-item>
                    <cargo :garbage="ship.garbage" :sizeX="ship.capacityX" :sizeY="ship.capacityY"></cargo>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col>
            <auto-router :planetsHashed="planetsHashed" :planetsCleanHashed="cleanPlanets" @start-from-here="startAutoRouter"></auto-router>
          </v-col>
        </v-row>
        <!-- <v-row dense>
          <v-col v-for="planet in planetsList">
            <planet-item :planet="planet"></planet-item>
          </v-col>
        </v-row> -->

      </v-container>
    </v-main>

    <v-navigation-drawer location="right" :disable-resize-watcher="true" :permanent="true">
      <v-list density="compact" nav>
        <v-list-item v-for="log in logs">
          <v-list-item-title>
            {{ log.text }}
          </v-list-item-title>
          <v-list-item-subtitle>
            П: {{ log.garbageStatistics.number }}, 
            К: {{ log.garbageStatistics.withus }}, 
            В: {{ log.garbageStatistics.taken }},
            %: {{ log.garbageStatistics.percent }},
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-app>
</template>

<script setup>

const roundName = ref('');
const ship = ref({
  "fuelUsed": 0,
  "planet": {
    "name": "Earth",
    "garbage": {}
  },
  "capacityX": 8,
  "capacityY": 11,
  "garbage": {}
});
const universe = ref([]);

const garbageMass = computed(() => {
  return Object.values(ship.value.garbage).reduce((total, item) => {
    return total + item.length;
  }, 0);
})

const cleanPlanets = ref({});

const planetsHashed = computed(() => {
  return universe.value.reduce((total, item) => {
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

const activePlanet = computed(() => {
  return planetsHashed.value[ship.value.planet.name];
});

async function fetchUniverse() {
  const ret = await $fetch('/api/universe');
  universe.value = ret.universe;
  roundName.value = ret.roundName;
  ship.value = ret.ship;

  useGraph('recreate', planetsList.value);
}
fetchUniverse();

const logs = ref([]);

const logsReversed = computed(() => {
  const lcopy = [...logs.value];
  return lcopy.reverse();
})

async function travelTo(route) {
  let travel = (route[route.length - 1]) === 'Eden';

  const { dataTravel, dataCollect, garbageToSend } = await $fetch('/api/travel', {
    method: 'POST',
    body: {
      planets: route
    },
    query: {
      loadcurrent: garbageMass.value,
      x: ship.value.capacityX,
      y: ship.value.capacityY,
      travel
    }
  });

  ship.value.planet.name = route[route.length - 1] || ship.value.planet.name;
  ship.value.fuelUsed += dataTravel.fuelDiff;

  const trashOnPlanet = Object.keys(dataTravel.planetGarbage || {}).length;
  const taken = Object.keys(garbageToSend || {}).length || 0;
  const withus = Object.keys(ship.value.garbage).length;
  if (taken === trashOnPlanet + withus) {
    cleanPlanets.value[ship.value.planet.name] = true;
  }

  ship.value.garbage = dataCollect?.garbage || dataTravel?.shipGarbage || {};


  const garbageList = Object.values(dataTravel.planetGarbage || {});
  const avgMass = (garbageList.reduce(((acc, item) => acc + item.length), 0) / garbageList.length) || 0;

  logs.value.push({
    id: Date.now(),
    text: 'Прилетели на ' + ship.value.planet.name,
    garbage: dataTravel.planetGarbage,
    garbageStatistics: {
      number: trashOnPlanet,
      taken,
      withus,
      percent: (garbageMass.value * 100 / (ship.value.capacityX * ship.value.capacityY)).toFixed(0)
    }
  })
}


// autorouter
const firstPlanet = 'Eden';
const destinations = computed(() => {
  const destinations = [];
  interateRoute(firstPlanet, destinations);
  return destinations.slice(1);
})

const mustGoHome = computed(() => {
  // return true;
  return garbageMass.value >= ship.value.capacityX * ship.value.capacityY * 0.3;
})

function interateRoute(planetName, destinations) {
  destinations.push(planetName);

  const planet = planetsHashed.value[planetName];

  planet?.routes.forEach(route => {
    const routeTo = route.to;
    if (destinations.includes(routeTo)) {
      return;
    }
    interateRoute(routeTo, destinations)
  })
}

const goOn = ref(false);

async function startAutoRouter(initIndex) {
  let index = 0;
  if (initIndex) {
    const newIndex = destinations.value.indexOf(initIndex);
    if (+newIndex >= 0) {
      index = newIndex;
    }
  }

  goOn.value = true;

  while (goOn.value) {
    const destination = destinations.value[index];

    if (!destination) {
      console.log('break', index, destinations.value);
      break;
    }

    if (destination === ship.value.planet.name) {
      const routeBack = useGraph('route', [ship.value.planet.name, 'Eden']);
      await travelTo(routeBack);
    }

    const route = useGraph('route', [ship.value.planet.name, destination]);
    await travelTo(route);

    if (cleanPlanets.value[destination]) {
      index++;
    }

    if (mustGoHome.value || !cleanPlanets.value[destination]) {
      const routeBack = useGraph('route', [ship.value.planet.name, 'Eden']);
      await travelTo(routeBack);
    }

  }
}

function stopAutoRouter() {
  goOn.value = false;
}

const sleep = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));

async function reset() {
  const data = await $fetch('/api/reset', {
    method: 'DELETE',
  });
  fetchUniverse();
}
</script>

<style scoped></style>
