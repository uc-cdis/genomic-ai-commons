import React from 'react';
import { ModelsPanel } from './ModelsPanel';
import sampleModels from './data/real_models.json';
import { convertModelRepositoryResponse } from './convert';
import type { ModelRepositoryResponse } from './types';

const ModelsCatalog = () => {

  const models = (sampleModels as unknown as ModelRepositoryResponse[]).map((x) => convertModelRepositoryResponse(x));

  return (
    <ModelsPanel models={models} />
  );
};

export default ModelsCatalog;
