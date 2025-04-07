import axios from "axios";

export interface CaseAnalysis {
    id?: number;
    analysis: string;
    dl_citation_no: string;
    created_at?: string;
    updated_at?: string;
}

export interface CaseAnalysisResponse {
    success: boolean;
    data: CaseAnalysis | CaseAnalysis[] | any;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface CaseDataForAnalysis {
    id: string;
    date: string;
    title: string;
    dl_citation_no: string;
    type: string;
    c_t: string; // court type
    region: {
        code: string;
    };
    // Add other fields as needed
    content?: string;
}


/**
 * Get a paginated list of case analyses
 */
export async function getCaseAnalyses(
    baseUrl: string,
    page: number = 1,
    perPage: number = 15,
    token?: string
) {
    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.get<CaseAnalysisResponse>(
            `${baseUrl}/case-analyses`,
            {
                headers,
                params: { page, per_page: perPage }
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching case analyses:", error);
        throw error;
    }
}

/**
 * Create a new case analysis
 */
export async function createCaseAnalysis(
    baseUrl: string,
    caseAnalysisData: CaseAnalysis,
    token?: string
) {

    const headers: Record<string, string> = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post<CaseAnalysisResponse>(
        `${baseUrl}/case-analyses`,
        caseAnalysisData,
        { headers }
    );

    return response.data;
}

/**
 * Get a specific case analysis by ID
 */
export async function getCaseAnalysisById(
    baseUrl: string,
    id: number,
    token?: string
) {
    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.get<CaseAnalysisResponse>(
            `${baseUrl}/case-analyses/${id}`,
            { headers }
        );

        return response.data;
    } catch (error) {
        console.error(`Error fetching case analysis with ID ${id}:`, error);
        throw error;
    }
}

/**
 * Update an existing case analysis
 */
export async function updateCaseAnalysis(
    baseUrl: string,
    id: number,
    caseAnalysisData: Partial<CaseAnalysis>,
    token?: string,
    method: 'put' | 'patch' = 'put'
) {
    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.request<CaseAnalysisResponse>({
            method,
            url: `${baseUrl}/case-analyses/${id}`,
            headers,
            data: caseAnalysisData
        });

        return response.data;
    } catch (error) {
        console.error(`Error updating case analysis with ID ${id}:`, error);
        throw error;
    }
}

/**
 * Delete a case analysis
 */
export async function deleteCaseAnalysis(
    baseUrl: string,
    id: number,
    token?: string
) {
    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.delete<CaseAnalysisResponse>(
            `${baseUrl}/case-analyses/${id}`,
            { headers }
        );

        return response.data;
    } catch (error) {
        console.error(`Error deleting case analysis with ID ${id}:`, error);
        throw error;
    }
}

/**
 * Search case analyses by keyword
 */
export async function searchCaseAnalyses(
    baseUrl: string,
    keyword: string,
    page: number = 1,
    perPage: number = 15,
    token?: string
) {
    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.get<CaseAnalysisResponse>(
            `${baseUrl}/case-analyses/search`,
            {
                headers,
                params: { keyword, page, per_page: perPage }
            }
        );

        return response.data;
    } catch (error) {
        console.error(`Error searching case analyses with keyword '${keyword}':`, error);
        throw error;
    }
}

/**
 * Find a case analysis by citation number
 */
export async function getCaseAnalysisByCitation(
    baseUrl: string,
    citation: string,
    token?: string
) {
    const headers: Record<string, string> = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get<CaseAnalysisResponse>(
        `${baseUrl}/case-analyses/citation/${citation}`,
        { headers }
    );

    return response.data;
}


/**
 * Process a case by vectorizing it and generating a deep analysis in one operation
 * @param baseUrl API base URL
 * @param caseData Case data to process
 * @param vectorStoreId Optional vector store ID (defaults to server's environment variable)
 * @param token Authentication token
 * @returns Response data containing the AI-generated analysis
 */
export async function analyzeCaseWithAI(
    baseUrl: string,
    caseData?: Record<string, any>,
    vectorStoreId?: string,
    token?: string
) {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        // Build URL with optional query parameter
        let url = `${baseUrl}/cases/analyze`;
        if (vectorStoreId) {
            url += `?vector_store_id=${encodeURIComponent(vectorStoreId)}`;
        }

        const response = await axios.post<CaseAnalysisResponse>(
            url,
            caseData,
            { headers }
        );

        console.log(`Successfully processed and analyzed case: ${caseData?.dl_citation_no}`);
        return response.data;
    } catch (error) {
        console.error(`Error processing case analysis for ${caseData?.dl_citation_no}:`, error);
        throw error;
    }
}