// Test script to trigger re-chunking of existing PDFs
// This can be run manually to update existing PDFs with chunking capability

const rechunkExistingPDFs = async () => {
    try {
        const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendURL}/api/pdfs/rechunk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Re-chunking completed:', result.message);
            console.log(`📊 Processed: ${result.processed}, Errors: ${result.errors}, Total: ${result.total}`);
        } else {
            console.error('❌ Re-chunking failed:', result.message);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

// Usage: Copy and paste this function into browser console
// Or call it from your frontend when needed
export { rechunkExistingPDFs };
