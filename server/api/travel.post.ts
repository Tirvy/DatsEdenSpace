export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event);
  const query = getQuery(event);

  const dataTravel: any = await $fetch('https://datsedenspace.datsteam.dev/player/travel', {
    headers: {
      "X-Auth-Token": `${config.token}`
    },
    method: 'POST',
    body
  });


  const cargoX = +(query.x || 0);
  const cargoY = +(query.y || 0);

  const allGarbage = { ...dataTravel.planetGarbage, ...dataTravel.shipGarbage };
  const squaredGarbage: Garbage[] = Object.keys(allGarbage).map(key => {
    const item = allGarbage[key];
    const size = squareTheThing(item);
    return {
      id: key,
      x: size.maxX,
      y: size.maxY,
      mass: item.length,
      canPack: size.maxX <= cargoX && size.maxY <= cargoY,
    }
  });
  const garbageBiggest = squaredGarbage.reduce((biggest: Garbage, current: Garbage) => {
    if (!current.canPack) {
      return biggest;
    }
    if (current.mass > biggest.mass) {
      return current;
    }
    return biggest;
  }, { id: '', x: 0, y: 0, mass: 0, canPack: false });


  console.log(dataTravel.planetGarbage, '\n', garbageBiggest.id, allGarbage[garbageBiggest.id]);

  if (!garbageBiggest.canPack) {
    return { dataTravel, dataCollect: null };
  }

  let error: any = null;
  let dataCollect: any = null;

  try {
    dataCollect = await fetch('https://datsedenspace.datsteam.dev/player/collect', {
      headers: {
        "X-Auth-Token": `${config.token}`
      },
      method: 'POST',
      body: {
        garbage: {
          [garbageBiggest.id]: allGarbage[garbageBiggest.id]
        }
      }
    });
  } catch (e) {
    error = e;
  }

  return { dataTravel, dataCollect, error };
})

// -----------------------

type Garbage = {
  id: string,
  x: number,
  y: number,
  mass: number,
  canPack: boolean,
}


function squareTheThing(garbage: [][]) {
  let maxX = 0;
  let maxY = 0;
  for (const row of garbage) {
    for (const cell of row) {
      if (cell[0] > maxX) {
        maxX = cell[0];
      }
      if (cell[1] > maxY) {
        maxY = cell[1];
      }
    }
  }
  return { maxX, maxY };
}