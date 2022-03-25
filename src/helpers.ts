//
export async function listAllPropertyIds(api) {
  console.log("list all property ids...");

  const properties = [];

  for (let i = 1; i < 20; i++) {
    console.log("Buscando pagina " + i);
    const { data } = await api.listProperties(i);
    const ids = data.properties.map((x) => x.id);
    properties.push(ids);
    if (ids.length < 10) break;
  }

  return properties.flat();
}
