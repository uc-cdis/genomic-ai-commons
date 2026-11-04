import { inference } from '@gen3/services_ui/server';

export default inference;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "12mb",
    },
    responseLimit: "12mb",
  },
};
