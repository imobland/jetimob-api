require("dotenv/config");
const fs = require("fs");
const _ = require("lodash");
const axios = require("axios");
const Admin = require("admin-core");

const admConn = Admin.DB.connect({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

async function loadImoblandProperties(props) {
  //
  console.log("Carregando imóveis...");

  const [rows] = await admConn.query(`
      SELECT property_id FROM property 
      WHERE realestate_id = ${props.id}
      AND published=1
      LIMIT ${props.limit ? props.limit : 5000};
  `);
  const total = rows.length;
  console.log("total " + total);

  var promises = [];
  var a = 10;
  const properties = [];

  const loadProperty = async (id) => {
    try {
      const res = await axios.get(
        `https://imobland-properties.s3.amazonaws.com/ppt-${id}.json`
      );
      const property = res.data.data;
      return property;
    } catch (e) {
      console.log(
        "NOT FOUND",
        `https://imobland-properties.s3.amazonaws.com/ppt-${id}.json`
      );
    }
  };

  for (let i = 0; i < total; i++) {
    console.log("baixando " + i + " de " + total);

    promises.push(loadProperty(rows[i].property_id));

    if (a == 0) {
      const rows = await Promise.all(promises);
      rows.map((property) => properties.push(property));
      promises = [];
      a = 49;
    } else a--;
  }

  admConn.close();

  fs.writeFileSync("./_properties.json", JSON.stringify(properties, null, 2));

  console.log(properties.length);
  console.log("OK");
}

export default loadImoblandProperties;
