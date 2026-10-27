import type { NavPageLayoutProps,Gen3AppConfigData  } from '@gen3/frontend';
import type { RNASeqConfiguration } from '../../features/RNAseqEmbeddings/sketch/types';

export type RNASeqPageConfiguration = RNASeqConfiguration & Gen3AppConfigData;

export interface RNASeqPageLayoutProps extends NavPageLayoutProps {
  configuration: RNASeqPageConfiguration;
}
