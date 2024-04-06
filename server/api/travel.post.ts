import fs from 'node:fs';
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const BinPacking2D = require('binpackingjs').BP2D;
const { Bin, Box, Packer } = BinPacking2D;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event);
  const query = getQuery(event);

  const loadCurrent = +(query.loadcurrent as string) || 0;
  const cargoX = +(query.x || 0);
  const cargoY = +(query.y || 0);
  const loadMax = cargoX * cargoY;
  let neededLoad = 0;

  if (loadCurrent === 0) {
    neededLoad = Math.ceil(loadMax * 0.3);
  } else {
    neededLoad = Math.min(Math.ceil(loadMax * 0.05) + loadCurrent, loadMax);
  }

  let error1: any = null;
  let dataTravel: any = {};
  await sleep(260);
  try {
    dataTravel= await $fetch('https://datsedenspace.datsteam.dev/player/travel', {
      headers: {
        "X-Auth-Token": `${config.token}`
      },
      method: 'POST',
      body
    });
  } catch (e) {
    error1 = e;
  }
  logToFile('travel', dataTravel);

  if (query.travel === 'true') {
    return { dataTravel, dataCollect: {}, error: null, garbageToSend: {}, error1 };
  }

  const allGarbage = { ...dataTravel.planetGarbage, ...dataTravel.shipGarbage };
  console.log(allGarbage);
  const squaredGarbage: Garbage[] = Object.keys(allGarbage).map(key => {
    const item = allGarbage[key];
    const size = squareTheThing(item);
    return {
      id: key,
      sizex: size.maxX + 1,
      sizey: size.maxY + 1,
      x: 0,
      y: 0,
      mass: item.length,
      canPack: size.maxX <= cargoX && size.maxY <= cargoY,
      rotate: false,
    }
  });


  const squaredGarbageSorted = squaredGarbage.sort((a, b) => a.mass - b.mass);



  const bin = new Bin(cargoX, cargoY);
  let boxes = squaredGarbageSorted.map(item => {
    return new Box(item.sizex, item.sizey);
  });
  let packer = new Packer([bin]);
  let packed_boxes = packer.pack(boxes);

  //ts-ignore-next-line
  let garbageCollection: Garbage[] = boxes.map((box, index) => {
    if (box.packed) {
      const garbage = squaredGarbageSorted[index];
      if (garbage.sizex !== box.width) {
        return {
          ...garbage,
          x: box.x,
          y: box.y,
          rotate: true,
        }
      }
      return {
        ...garbage,
        x: box.x,
        y: box.y,
      }
    }
    return null
  }).filter(item => item !== null);


  // const garbageFiltered = squaredGarbage.filter(item => item.x <= 4 && item.y <= 4);
  // const garbageSorted = garbageFiltered.sort((a, b) => a.mass - b.mass);
  // const garbageOffsets = [[0, 0], [0, 4], [4, 0], [4, 4], [8, 0], [0, 8]];
  // const garbageCollection = garbageSorted.slice(0, 4).map((item, index) => {
  //   const offset = garbageOffsets[index];
  //   return {
  //     id: item.id,
  //     x: offset[0],
  //     y: offset[1],
  //     mass: item.mass,
  //     canPack: item.canPack,
  //   }
  // });

  const garbageToSend = garbageCollection.reduce((acc: any, item) => {
    if (!item.rotate) {
      acc[item.id] = allGarbage[item.id].map((coods: number[]) => {
        return [coods[0] + item.x, coods[1] + item.y]
      });
    } else {
      acc[item.id] = allGarbage[item.id].map((coods: number[]) => {
        return [item.sizey - 1 - coods[1] + item.x, coods[0] + item.y]
      });
    }
    return acc;
  }, {});

  let error: any = null;
  let dataCollect: any = null;

  logToFile('garbageToSend', garbageToSend);
  await sleep(260);
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

  return { dataTravel, dataCollect, error, garbageToSend, error1 };
})

// -----------------------

type Garbage = {
  id: string,
  sizex: number,
  sizey: number,
  x: number,
  y: number,
  mass: number,
  canPack: boolean,
  rotate: boolean,
}


function squareTheThing(garbage: [][]) {
  let maxX = 0;
  let maxY = 0;
  garbage.forEach(cell => {
    maxX = Math.max(maxX, +cell[0] || 0);
    maxY = Math.max(maxY, +cell[1] || 0);
  });
  return { maxX, maxY };
}

function logToFile(type: string, data: any) {
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