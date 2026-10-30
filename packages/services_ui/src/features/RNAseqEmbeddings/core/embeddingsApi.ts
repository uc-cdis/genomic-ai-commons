import { gen3Api} from '@gen3/core';
import {GEN3_EMBEDDINGS_SERVICE} from "./constants";

interface Embedding {
  id: string;
  embedding: number[];
}



export const embeddingsApi = gen3Api.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableEmbeddings: builder.query<any, string>({
      query: (collection) => ({
        url: `${GEN3_EMBEDDINGS_SERVICE}/${collection}&counts=true`,
      }),
    }),
  }),
});


export const { useGetAvailableEmbeddingsQuery } = embeddingsApi;
