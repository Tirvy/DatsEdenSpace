export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  // const body = await readBody(event);
  const query = getQuery(event);


  const data = await $fetch('https://datsedenspace.datsteam.dev/player/reset', {
    headers: {
      "X-Auth-Token": `${config.token}`
    },
    method: 'DELETE',
  });

  
  return data;
})