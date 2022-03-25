import cli from "cli-color";

function handleResponse(fn) {
  return async (...props: any) => {
    try {
      const response = await fn.apply(null, props);
      return response.data;
    } catch (err) {
      const message = `JETIMOB ERROR - ${err?.response?.status} ${err?.response?.statusText}`;
      console.log(cli.red.underline(message));
      return {
        err,
        response: err.response,
        data: err.response?.data,
      };
    }
  };
}

export default handleResponse;
