import { API_ENDPOINTS } from '../../constants';

// This is a mock service. A real implementation would require gRPC-web or a backend proxy.
export const sendGoogleOciConversion = async (customerId: string, devToken: string, payload: any) => {
    const url = API_ENDPOINTS.GOOGLE_OCI(customerId);
    
    console.log('--- SIMULATING GOOGLE ADS API CALL ---');
    console.log('Endpoint:', url);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        // Mocking a successful response after a short delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Check if there are valid identifiers
        const hasValidIdentifier = payload.conversions.some((c: any) => 
            c.gclid || (c.userIdentifiers && c.userIdentifiers.length > 0)
        );

        if (!hasValidIdentifier) {
            throw new Error("Conversion must contain a gclid or at least one user identifier.");
        }

        const mockResponse = {
            partialFailureError: null,
            results: payload.conversions.map((c: any) => ({
                gclid: c.gclid,
                conversionAction: c.conversionAction,
                conversionDateTime: c.conversionDateTime,
            })),
        };

        return { success: true, data: mockResponse };

    } catch (error) {
        console.error('Google OCI Error:', error);
        return { success: false, error };
    }
};
