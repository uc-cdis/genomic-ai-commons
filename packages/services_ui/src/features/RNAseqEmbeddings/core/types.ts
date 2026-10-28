export interface InputFile {
    name: string;
    type: string;
    uploadedAt: string;
}

export interface DataFileBundle {
    id: string;
    zipFile: InputFile;
    metadataFile: InputFile;
}
