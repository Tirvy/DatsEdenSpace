export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  // const body = await readBody(event);
  const query = getQuery(event);

  
  return runtimeConfig.token;
})