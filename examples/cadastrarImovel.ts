import { JetimobApi } from "../src";
import getTokenFromCookie from "../src/utils/getTokenFromCookie";
require("dotenv/config");
import { imovelExemplo } from "./_imovel";

/** Adicione o Cookie na variável de ambiente JETIMOB_COOKIE */

const AccessToken = getTokenFromCookie(process.env.JETIMOB_COOKIE);

const Api = JetimobApi({ token: AccessToken });

const promise = Api.newProperty(imovelExemplo("dev-code"));

promise.then((response) => {
  if (response.data.status_code == 406) {
    console.log("ERROR", response.data.messages);
  } else {
    console.log("OK", response);
  }
});
