import axios from "axios";
import { JetimobApi } from "../src";
import getTokenFromCookie from "../src/utils/getTokenFromCookie";

const newLine = `\n`;
const line = "\n" + "-".repeat(80);

const getPropertyIDByCode = (code) => {
  const codes = {
    "101": 8108,
    "259": 8129,
    "102": 8136,
    "511": 8141,
    "520": 8269,
    "521": 8271,
    "522": 8272,
    "523": 8273,
    "524": 8274,
    "531": 8315,
    "544": 8371,
    "211": 8407,
    "213": 8413,
    "214": 8415,
    "217": 8422,
    "222": 8432,
    "540": 8615,
    "401": 8723,
    "402": 8724,
    "411": 9250,
    "226": 9306,
    "227": 9327,
    "530": 9596,
    "548": 9932,
    "549": 10121,
    "229": 10141,
    "110": 10145,
    "551": 10592,
    "122": 10606,
    "504": 10630,
    "552": 10644,
    "224": 10767,
    "591": 10810,
    "554": 10916,
    "301": 11845,
    "228": 11879,
    "205": 12082,
    "219": 12141,
    "563": 12375,
    "230": 12506,
    "566": 12509,
    "231": 12512,
    "234": 12871,
    "235": 12900,
    "121": 12914,
    "114": 13076,
    "116": 13327,
    "405": 13347,
    "409": 13552,
    "407": 13641,
    "408": 13668,
    "302": 14076,
    "605": 14201,
    "506": 15289,
    "208": 20367,
    "204": 20368,
    "120": 20783,
    "602": 20842,
    "528": 22182,
    "237": 22504,
    "238": 24767,
    "537": 25144,
    "529": 26033,
    "149": 26039,
    "124": 26224,
    "503": 26515,
    "536": 26691,
    "541": 26695,
    "308": 27014,
    "638": 27048,
    "413": 27604,
    "310": 29252,
    "414": 30810,
    "556": 31210,
    "225": 31213,
    "127": 31311,
    "240": 31383,
    "313": 31385,
    "558": 31389,
    "560": 31398,
    "244": 31542,
    "569": 31559,
    "570": 31562,
    "574": 31735,
    "136": 31765,
    "242": 31784,
    "575": 32026,
    "578": 32433,
    "579": 33039,
    "416": 34087,
    "418": 35658,
    "314": 35712,
    "426": 38018,
    "316": 38206,
    "582": 38240,
    "317": 38375,
    "137": 38393,
    "245": 38395,
    "583": 38398,
    "585": 38405,
    "584": 38407,
    "142": 38420,
    "141": 38421,
    "586": 38434,
    "588": 40778,
    "590": 40900,
    "601": 42865,
    "420": 50440,
    "319": 53241,
    "320": 53255,
    "250": 56138,
    "251": 56692,
    "249": 57150,
    "322": 57287,
    "233": 57387,
    "254": 58143,
    "421": 58438,
    "422": 58439,
    "423": 58626,
    "404": 66548,
    "424": 66554,
    "545": 68772,
    "215": 69646,
    "633": 73450,
    "581": 75010,
    "303": 83353,
    "501": 83368,
    "201": 83371,
    "202": 83376,
    "207": 83385,
    "304": 83390,
    "203": 83438,
  };
  return codes[code];
};

function getPrivateDescription(imovel, property, imoblandAttributes) {
  const text = imovel.observation_internal.split(line);
  const observation_internal = text[0];
  return (
    observation_internal +
    line +
    `
Atributos sistema Imobland

${imoblandAttributes}

 ➜ Fonte: http://admin.imobland.com.br/property/${property.property_id}/edit
  `
  );
}

const AccessToken = getTokenFromCookie(process.env.JETIMOB_COOKIE);

const api = JetimobApi({ token: AccessToken });

api.setDefaultValues({
  person_id: 1593152, //person.data.id,
  agent_id: 1593148,
  building_status: 3,
  occupation: 1,
});

// const person = await api.getPersonByName("Imobiliária Vila Nova");
// console.log(person.data.id);

async function syncPropertyByCode(property_code, options: any = {}) {
  const property_id = getPropertyIDByCode(property_code);

  if (!property_id) {
    console.log(`Imóvel ${property_code} não cadastrado na Imobland`);
    return {};
  }

  const { data } = await axios.get(
    `https://imobland-properties.s3.amazonaws.com/ppt-${property_id}.json`
  );
  const property = data.data;

  const tags =
    property.attributes
      .filter((attr) => attr.type == "bool" && attr.value)
      .map((attr) => {
        return " ➜ " + attr.label;
      })
      .join("\n") + newLine;

  const selects = property.attributes
    .filter((attr) => attr.type == "select" && attr.value_string)
    .map((attr) => {
      return " ➜ " + attr.label + ": " + attr.value_string;
    })
    .join(newLine);

  const keyValues = property.attributes
    .filter(
      (attr) =>
        (attr.type == "integer" || attr.type == "number") &&
        attr.value != undefined
    )
    .map((attr) => {
      return " ➜ " + attr.label + ": " + attr.value;
    })
    .join(newLine);

  const imoblandAttributes = [tags, keyValues, selects].join(newLine);

  const res = await api.updateProperty(property_code, (imovel) => {
    const contracts = imovel.contracts;

    if (contracts[0].price != parseInt(property.price + "00")) {
      console.log(
        `Preço errado -> ${contracts[0].price} - Ajustando para `,
        parseInt(property.price + "00")
      );
      contracts[0].price = parseInt(property.price + "00");
    }

    return {
      // title: property.title,
      contracts,
      observation_internal: getPrivateDescription(
        imovel,
        property,
        imoblandAttributes
      ),
      // number: imovel.number + (options.duplicatedAddress ? " (duplicado)" : ""),
    };
  });

  if (
    res.errors &&
    res.errors[0]?.message ==
      'Duplicidade! O imóvel "116" está cadastrado neste endereço.'
  ) {
  }

  return res;
}

async function syncAllProperties() {
  //
  console.log("Atualizando imóveis");

  const $codes = await api.listAllPropertyCodes();

  let index = 0;

  const codes = $codes.filter((_, i) => i >= index);

  for (const x in codes) {
    const code = codes[x];

    console.log(" --------------------------------------------- ");
    console.log(" Sync " + code + " ...");

    let response;

    try {
      response = await syncPropertyByCode(code, {});
    } catch (e) {
      console.log(`ERROR EXCEPTION (${index})`, e.response);
      break;
    }

    if (response.status_code == 403) {
      console.log(`ERROR 403 (${index})`, response);
      break;
    }

    if (response.status_code == 406) {
      console.log(`ERROR (${index})`, response.messages);
      break;

      // console.log("Tentanto novamente...");
      // response = await syncPropertyByCode(code, { duplicatedAddress: true });
      // if (response.status_code == 406) {
      //   console.log(`ERROR (${index})`, response.messages);
      //   break;
      // }
    }
    console.log(`OK (${index})`, response);
    index++;
  }

  console.log("Concluído");
}

syncAllProperties();
