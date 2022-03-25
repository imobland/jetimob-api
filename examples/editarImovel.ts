import { JetimobApi } from "../src";
import getTokenFromCookie from "../src/utils/getTokenFromCookie";
require("dotenv/config");

/** Adicione o Cookie na variável de ambiente JETIMOB_COOKIE */

const AccessToken = getTokenFromCookie(process.env.JETIMOB_COOKIE);

const Api = JetimobApi({ token: AccessToken });

// Torna o titulo todo em maiúsculo

const promise = Api.updateProperty("203", (imovel) => ({
  title: imovel.title.toUpperCase(),
}));

promise.then((response) => console.log(response));
