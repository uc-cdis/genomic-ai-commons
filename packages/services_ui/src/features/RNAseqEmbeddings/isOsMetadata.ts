// macOS adds __MACOSX/ resource-fork folders and .DS_Store files when zipping
export const isOsMetadata = (path: string) =>
    path.split('/').some((part) => part === '__MACOSX' || part === '.DS_Store');
