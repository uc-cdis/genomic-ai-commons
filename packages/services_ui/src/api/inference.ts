import type { NextApiRequest, NextApiResponse } from 'next';
import { readFile } from 'fs/promises';

const MOCKED_DATA_DIR = './data/inference_response';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { tsv, sample_id } = req.body;
    if (!tsv || !sample_id) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // mock the API server when in development mode:
    if (process.env.NODE_ENV === 'development') {
        try {
            // given the sample_id load the corresponding tsv file
            const jsonFilePath = `${MOCKED_DATA_DIR}/${sample_id}.json`;
            const jsonContent = await readFile(jsonFilePath, 'utf8');
            return res.status(200).json(jsonContent);
        }
        catch (e:unknown) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    // default case: return a 500 error
    return res.status(500).json({ message: 'Internal server error' });
}
