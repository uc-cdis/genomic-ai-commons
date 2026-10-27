import JSZip from 'jszip';

// Helper function to open IndexedDB
function openDatabase(dbName: string, storeName: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(storeName)) {
                // Use the relative file path as the unique key
                db.createObjectStore(storeName);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Function to read ZIP and save to IndexedDB
async function loadZipAndSaveToIndexedDB(file: File, dbName: string = "gen3ZipCache", storeName: string = "files"): Promise<boolean> {
    try {
        const db = await openDatabase(dbName, storeName);
        const zip = new JSZip();
        const contents = await zip.loadAsync(file);

        // Open a readwrite transaction
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);

        // Track promises for completion
        const storePromises: Promise<void>[] = [];

        for (const [relativePath, zipEntry] of Object.entries(contents.files)) {
            if (zipEntry.dir) continue; // Skip folders

            // Read file data as a Blob (supports binary files like images, PDFs, etc.)
            const blobData = await zipEntry.async('blob');

            // Wrap the IDB Request in a promise
            const putPromise = new Promise<void>((resolve, reject) => {
                const request = store.put(blobData, relativePath);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            storePromises.push(putPromise);
        }

        // Wait for all files to be saved
        await Promise.all(storePromises);
        return true;
    } catch (error) {
        console.error('Error processing ZIP file or accessing IndexedDB:', error);
        return false;
    }
}

async function getFileFromIndexedDB(filePath: string, dbName: string = "gen3ZipCache", storeName: string = "files"): Promise<Blob | null> {
    const db = await openDatabase(dbName, storeName);
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(filePath);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}
