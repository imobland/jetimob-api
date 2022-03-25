import axios from "axios";
import FormData from "form-data";
import handleResponse from "./lib/handleResponse";

type Props = { token: string };

export default function JetimobApi({ token }: Props) {
  //
  const headers = token ? { Cookie: `jetimob_session=${token}` } : {};

  type DefaultValues = {
    person_id: number;
    building_status: number;
    occupation: number;
    agent_id: number;
  };

  var defaults: DefaultValues = null;

  const setDefaultValues = (data: DefaultValues) => {
    defaults = data;
  };

  /* ------------------------------------------------------------------------ */

  const listProperties = handleResponse(async (page: number = 1) => {
    console.log("list properties...");

    const { data } = await axios.request({
      method: "GET",
      url: `https://app.jetimob.com/api/imoveis?page=${page}`,
      headers,
    });
    return data;
  });

  /* ------------------------------------------------------------------------ */

  const listAllPropertyCodes = async () => {
    console.log("list all property ids...");

    const properties = [];

    for (let i = 1; i < 20; i++) {
      console.log("Buscando pagina " + i);
      const response = await listProperties(i);
      const ids = response.properties.map((x) => x.code);
      properties.push(ids);
      if (ids.length < 10) break;
    }

    return properties.flat();
  };

  const newProperty = handleResponse((data: any) => {
    console.log("creating new property...");
    const options: any = {
      method: "POST",
      url: `https://app.jetimob.com/api/imoveis/novo`,
      headers,
      data,
    };
    return axios.request(options);
  });

  /* ------------------------------------------------------------------------ */

  const getProperty = handleResponse((id: string) => {
    return axios.request({
      method: "GET",
      url: `https://app.jetimob.com/api/imoveis/${id}/editar`,
      headers,
    });
  });

  /* ------------------------------------------------------------------------ */

  const deleteProperty = handleResponse(async (id: string) => {
    console.log("deleting property " + id);
    const res = await axios.request({
      method: "DELETE",
      url: `https://app.jetimob.com/api/imoveis/${id}`,
      headers,
    });
    console.log(res.data);
    return res.data;
  });

  /* ------------------------------------------------------------------------ */

  const getPersons = handleResponse(() =>
    axios.request({
      method: "GET",
      url: `https://app.jetimob.com/api/persons`,
      headers,
    })
  );

  /* ------------------------------------------------------------------------ */

  const getPersonByName = async (name) => {
    const { err, response, data } = await getPersons();
    if (err) return { err, response };
    const person = data?.persons?.find((x) => x.name == name);
    return { err, response, data: person };
  };

  /* ------------------------------------------------------------------------ */

  const setProperty = handleResponse((id: string, data: any) => {
    const options: any = {
      method: "POST",
      url: `https://app.jetimob.com/api/imoveis/${id}/editar`,
      headers,
      data,
    };
    return axios.request(options);
  });

  /* ------------------------------------------------------------------------ */

  const updateProperty = handleResponse(
    async (id: string, payload: Function) => {
      //
      const property = await getProperty(id);

      if (property.err) return property;

      const mountedProperty = {
        ...property.data.property,
        blueprints: property.data.old_blueprints,
        building_type: property.data.building_type,
        facilitiesGroups: property.data.facilitiesGroups,
        images: property.data.old_images,
        ...payload(property.data.property),
      };

      mergeDefaultValues(mountedProperty);

      return await setProperty(id, mountedProperty);
    }
  );

  /* ------------------------------------------------------------------------ */

  const uploadPicture = handleResponse(async (url) => {
    const response = await axios.get(url, { responseType: "stream" });

    try {
      const data: any = new FormData();
      data.append("file", response.data, "pic.jpg");
      data.append("category", "1");

      const res = await axios.post(
        "https://app.jetimob.com/api/upload-image",
        data,
        {
          headers: {
            "Accept-Language": "en-US,en;q=0.8",
            "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
            Cookie: `jetimob_session=${token}`,
          },
        }
      );
      return res.data;
    } catch (e) {
      console.log("ERROR", e);
    }
  });

  /* ------------------------------------------------------------------------ */

  const mergeDefaultValues = (property) => {
    //
    if (!property.street) property.street = "[Rua não cadastrada]";

    if (!property.number) property.number = `[${property.code}]`;

    if (property.building_status == undefined)
      property.building_status = defaults.building_status;

    if (!property.occupation && property.occupation !== 0)
      property.occupation = defaults.occupation;

    if (!property.agent?.person_id)
      property.agent = { person_id: defaults.agent_id };

    if (!property.person_owners) {
      property.person_owners = [
        { person: { person_id: defaults.person_id }, percentage: 100 },
      ];
    }
  };

  /* ------------------------------------------------------------------------ */

  return {
    newProperty,
    getProperty,
    listProperties,
    listAllPropertyCodes,
    setProperty,
    updateProperty,
    getPersons,
    getPersonByName,
    uploadPicture,
    deleteProperty,
    setDefaultValues,
  };
}
