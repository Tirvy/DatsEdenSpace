import fs from 'node:fs';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event);
  const query = getQuery(event);

  const loadCurrent = +(query.loadcurrent as string) || 0;
  const loadMax = +(query.loadmax as string) || 0;
  let neededLoad = 0;
  if (loadCurrent === 0) {
    neededLoad = Math.ceil(loadMax * 0.3);
  } else {
    neededLoad = Math.min(Math.ceil(loadMax * 0.05) + loadCurrent, loadMax);
  }

  const dataTravel: any = await $fetch('https://datsedenspace.datsteam.dev/player/travel', {
    headers: {
      "X-Auth-Token": `${config.token}`
    },
    method: 'POST',
    body
  });
  logToFile('travel', dataTravel);

  if (query.travel === 'true') {
    return {dataTravel};
  }



  const cargoX = +(query.x || 0);
  const cargoY = +(query.y || 0);

  const allGarbage = { ...dataTravel.planetGarbage, ...dataTravel.shipGarbage };
  const squaredGarbage: Garbage[] = Object.keys(allGarbage).map(key => {
    const item = allGarbage[key];
    const size = squareTheThing(item);
    return {
      id: key,
      x: size.maxX + 1,
      y: size.maxY + 1,
      mass: item.length,
      canPack: size.maxX <= cargoX && size.maxY <= cargoY,
    }
  });

  const garbageFiltered = squaredGarbage.filter(item => item.x <= 4 && item.y <= 4);
  const garbageSorted = garbageFiltered.sort((a, b) => b.mass - a.mass);

  const garbageOffsets = [[0, 0], [0, 4], [4, 0], [4, 4], [8, 0], [0, 8]];

  const garbageCollection = garbageSorted.slice(0, 4).map((item, index) => {
    const offset = garbageOffsets[index];
    return {
      id: item.id,
      x: offset[0],
      y: offset[1],
      mass: item.mass,
      canPack: item.canPack,
    }
  });
  const garbageToSend = garbageCollection.reduce((acc: any, item) => {
    acc[item.id] = allGarbage[item.id].map((coods: number[]) => {
      return [coods[0] + item.x, coods[1] + item.y]
    });
    return acc;
  }, {});

  let error: any = null;
  let dataCollect: any = null;

  logToFile('garbageToSend', garbageToSend);
  try {
    dataCollect = await $fetch('https://datsedenspace.datsteam.dev/player/collect', {
      headers: {
        "X-Auth-Token": `${config.token}`
      },
      method: 'POST',
      body: {
        garbage: garbageToSend
      }
    }).catch((err) => err.data);
  } catch (e) {
    error = e;
  }

  logToFile('collect', dataCollect);

  return { dataTravel, dataCollect, error, garbageToSend };
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

function logToFile(type:string, data: any) {
  try {
    var datetime = new Date();

    fs.writeFileSync('/Users/ernest/Documents/travel-collect.txt', `\n\n\n${datetime}:\n${type}\n${JSON.stringify(data)}`, { flag: 'a' });
    // file written successfully
  } catch (err) {
    console.error(err);
  }
}

const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));