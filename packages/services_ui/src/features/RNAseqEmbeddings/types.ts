

export enum ProcessingState {
    Idle,
    Starting,
    Complete,
    Error

}

export interface ApplyEmbeddings {
    state: ProcessingState
}

export interface RNASeqConfiguration {
    label?: string;
}
