<template>
  <div>
    <table class="cargotable">
      <tr v-for="row in garbageRows">
        <td v-for="(cell, index) in row" class="cell" :style="cell.style" :key="cell.key">

        </td>
      </tr>
    </table>

  </div>
</template>

<script lang="ts" setup>
const colors = ['red', 'green', 'blue', 'magenta', 'orange', 'purple', 'violet', 'pink', 'yellow', 'cyan', 'brown', 'gray', 'deep-purple', 'indigo', 'light-blue'];

const props = defineProps<{
  garbage: {[id: string]: number[][]},
  sizeX: number,
  sizeY: number,
}>()

const garbageRows = computed(() => {
  const rows: { style: { backgroundColor: string },  key: string }[][] = [];
  for (let i = 0; i < props.sizeX; i++) {
    rows.push([]);
    for (let j = 0; j < props.sizeY; j++) {
      rows[i].push({
        style: {
          backgroundColor: 'white'
        },
        key: `${i}-${j}`
      });
    }
  }

  return Object.keys(props.garbage).reduce((total, key: string, index) => {
    const item = props.garbage[key];
    item.forEach(coords => {
      const color = colors[index];
      total[coords[0]][coords[1]].style = {
          backgroundColor: color
        };
    });
    return total;
  }, rows)
});

</script>

<style scoped>
.cargotable, .cell {
  border-collapse: collapse;
  border: 1px solid;
}

.cell {
  width: 10px;
  height: 8px;
}

</style>