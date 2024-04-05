export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  // const body = await readBody(event);
  const query = getQuery(event);


  // const repo = await $fetch('https://api.github.com/repos/nuxt/nuxt', {
  //   headers: {
  //     Authorization: `token ${config.token}`
  //   }
  // })

  
  return config.token;
})