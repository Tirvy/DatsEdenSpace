<template>
  <v-app id="inspire">
    <v-app-bar dense>
      <template v-slot:prepend>
        <v-avatar color="yellow">Ё</v-avatar>
      </template>
      <v-row>
        <v-col>
          <v-btn @click="fetchUnivers">обновить</v-btn>
        </v-col>
      </v-row>
      <div>DatsEdenSpace</div>
      <v-spacer></v-spacer>
    </v-app-bar>



    <v-main>
      <v-container fluid>
        <v-row v-if="activePlanet">
          <v-col>
            <v-card style="width: 300px;">
              <v-card-title :style="activePlanet.active ? 'background: green' : ''">
                Мы на планете: {{ activePlanet.name }}
              </v-card-title>
              <v-card-actions>
                <v-list dense>
                  <v-list-subheader>
                    Куда летим?
                  </v-list-subheader>
                  <v-list-item v-for="route in activePlanet.routes" @click="travelTo(route.to)">
                    {{ route.to }}: {{ route.cost }}
                  </v-list-item>
                </v-list>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-row dense>
          <v-col v-for="planet in planetsList">
            <v-card style="width: 300px;">
              <v-card-title :style="planet.active ? 'background: green' : ''">
                {{ planet.name }}
              </v-card-title>
              <v-card-actions>
                <v-list dense>
                  <v-list-item v-for="route in planet.routes">
                    {{ route.to }}: {{ route.cost }}
                  </v-list-item>
                </v-list>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

      </v-container>
    </v-main>

    <v-navigation-drawer location="right" :disable-resize-watcher="true" :permanent="true">
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

const planetsHashed = computed(() => {
  return universe.value.reduce((total, item) => {
    const from = item[0];
    const to = item[1];
    const cost = item[2];
    if (!total[from]) {
      total[from] = {
        name: from,
        routes: [],
        garbage: 0,
        active: false
      }

      if (ship.value.planet?.name === from) {
        total[from].active = true;
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

async function fetchUnivers() {
  const ret = await $fetch('/api/universe');
  universe.value = ret.universe;
  roundName.value = ret.roundName;
  ship.value = ret.ship;

}
fetchUnivers();

async function travelTo(planetName) {
  const { dataTravel, dataCollect } = await $fetch('/api/travel', {
    method: 'POST',
    body: {
      planets: [planetName]
    }
  });

  ship.value.planet.name = planetName;
  ship.value.fuelUsed += dataTravel.fuelDiff;
  ship.value.garbage = dataCollect?.garbage || dataTravel?.shipGarbage || {};

}
</script>
