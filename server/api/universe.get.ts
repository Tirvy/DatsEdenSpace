import fs from 'node:fs';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  // const body = await readBody(event);
  const query = getQuery(event);

  const data = await $fetch('https://datsedenspace.datsteam.dev/player/universe', {
    headers: {
      "X-Auth-Token": `${config.token}`
    }
  });

  // const repo = await $fetch('https://api.github.com/repos/nuxt/nuxt', {
  //   headers: {
  //     Authorization: `token ${config.token}`
  //   }
  // })

  
try {
  var datetime = new Date();

  fs.writeFileSync('/Users/ernest/Documents/universe.txt', `\n\n\n${datetime}:\n${JSON.stringify(data)}`, { flag: 'a' });
  // file written successfully
} catch (err) {
  console.error(err);
}
  
  return data;
})

/*{
  "name": "MyTeam",
  "ship": {
    "capacityX": 8,
    "capacityY": 11,
    "fuelUsed": 1000,
    "garbage": {
      "6fTzQid": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ]
      ],
      "RVnTkM59": [
        [
          0,
          0
        ],
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          2,
          1
        ],
        [
          1,
          2
        ]
      ]
    },
    "planet": {
      "garbage": {
        "6fTzQid": [
          [
            0,
            0
          ],
          [
            0,
            1
          ],
          [
            1,
            1
          ]
        ],
        "RVnTkM59": [
          [
            0,
            0
          ],
          [
            0,
            1
          ],
          [
            1,
            1
          ],
          [
            2,
            1
          ],
          [
            1,
            2
          ]
        ]
      },
      "name": "string"
    }
  },
  "universe": [
    [
      "Earth",
      "Reinger",
      100
    ],
    [
      "Reinger",
      "Earth",
      100
    ],
    [
      "Reinger",
      "Larkin",
      100
    ]
  ]
}*/