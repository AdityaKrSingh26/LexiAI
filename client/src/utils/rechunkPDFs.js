import api from './api.js';

const rechunkExistingPDFs = async () => {
    try {
        const { data } = await api.post('/api/pdfs/rechunk');

        if (data.success) {
            console.log('Re-chunking completed:', data.message);
            console.log(`Processed: ${data.processed}, Errors: ${data.errors}, Total: ${data.total}`);
        } else {
            console.error('Re-chunking failed:', data.message);
        }
    } catch (error) {
        console.error('Error during re-chunking:', error.response?.data?.message || error.message);
    }
};

export { rechunkExistingPDFs };
