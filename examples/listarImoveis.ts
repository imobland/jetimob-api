import { JetimobApi } from "../src";
import getTokenFromCookie from "../src/utils/getTokenFromCookie";

/** Adicione o Cookie na variável de ambiente JETIMOB_COOKIE */

const AccessToken = getTokenFromCookie(process.env.JETIMOB_COOKIE);

const Api = JetimobApi({ token: AccessToken });

Api.listProperties().then((response) => console.log(response.properties));
