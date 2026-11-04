import type { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig, ContentSource } from '@gen3/frontend';
import type { RNASeqPageLayoutProps } from './types';
import type { RNASeqConfiguration } from '../../features/RNAseqEmbeddings/types';
import { GEN3_COMMONS_NAME } from '@gen3/core';

const DEFAULT_RNASEQ_CONFIGURATION = {};


export const RNASeqPageGetServerSideProps: GetServerSideProps<
  RNASeqPageLayoutProps
> = async () => {
  try {
    const RNASeqConfiguration: RNASeqConfiguration =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/RNASeq.json`,
      );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: RNASeqConfiguration,
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn('Error fetching RNASeq configuration:', error.message);
      console.warn('Returning default configuration');
    }
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        configuration: DEFAULT_RNASEQ_CONFIGURATION,
      },
    };
  }
};
