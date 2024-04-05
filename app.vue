<template>
  <v-app id="inspire">
    <v-app-bar dense>
      <template v-slot:prepend>
        <v-avatar color="yellow">Ё</v-avatar>
      </template>
      <div>DatsEdenSpace</div>
      <v-spacer></v-spacer>
    </v-app-bar>



    <v-main>
        <v-container>

            <v-row>
                <v-col>
                    тут основная инфа
                </v-col>
            </v-row>

        </v-container>
    </v-main>

    <v-navigation-drawer location="right" :disable-resize-watcher="true" :permanent="true">
        <v-list density="compact" nav>
            <v-list-item @click="fetchit">
              тут доп
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
  </v-app>
</template>

<script setup>

function fetchit() {
  $fetch('/api/get-data');
}
</script>
