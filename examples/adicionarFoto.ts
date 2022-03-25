import { JetimobApi } from "../src";
import getTokenFromCookie from "../src/utils/getTokenFromCookie";
require("dotenv/config");

/** Adicione o Cookie na variável de ambiente JETIMOB_COOKIE */

const AccessToken = getTokenFromCookie(process.env.JETIMOB_COOKIE);

const Api = JetimobApi({ token: AccessToken });

const src =
  "https://imobland-pictures-v2.s3.amazonaws.com/38wN9b6A/pldGAnVa/c2e6fbd2-d180-4977-aee6-35e015bfcdbc.PNG";

const promise = Api.uploadPicture(src);

promise.then((response) => console.log(response));
