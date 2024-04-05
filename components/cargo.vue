<template>
  <div>
    <table class="cargotable">
      <tr v-for="row in garbageRows">
        <td v-for="(cell, index) in row" class="cell" :style="cell.style" :key="index">

        </td>
      </tr>
    </table>

  </div>
</template>

<script lang="ts" setup>
const colors = ['red', 'green', 'blue', 'magenta', 'orange', 'purple'];

const props = defineProps<{
  garbage: {[id: string]: number[][]},
  sizeX: number,
  sizeY: number,
}>()

const garbageRows = computed(() => {
  const rows: { style: { backgroundColor: string },  key: string }[][] = [];
  for (let i = 0; i < props.sizeY; i++) {
    rows.push(new Array(props.sizeX).fill({
      style: {
        backgroundColor: 'white'
      }
    }));
  }

  return Object.keys(props.garbage).reduce((total, key: string, index) => {
    const item = props.garbage[key];
    item.forEach(coords => {
      total[coords[0]][coords[1]] = {
        style: {
          backgroundColor: colors[index]
        },
        key,
      }
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