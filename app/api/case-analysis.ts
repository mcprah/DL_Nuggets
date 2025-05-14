import axios from "axios";

export interface CaseAnalysis {
    id?: number;
    analysis: string;
    dl_citation_no: string;
    vector_store_id?: string;
    vector_file_id?: string;
    created_at?: string;
    updated_at?: string;

    // Case Information
    court?: string;
    location?: string;
    date_of_judgment?: string;
    type_of_decision?: string;
    
    // Judicial Panel
    opinion_by?: string;
    nature_of_vote?: string;
    coram?: string[]; 
    
    // Representation
    counsel?: string[]; 
    
    // Case Classification
    category_of_case?: string;
    area_of_law?: string[]; 
    subject_index?: string[]; 
    catchwords?: string[]; 
    
    // Case Details
    summary_of_facts?: string;
    procedural_history?: string;
    issues_for_determination?: string[]; 
    legal_arguments?: string;
    holding?: string[]; 
    ratio_decidendi?: string;
    obiter_dictum?: string;
    important_quotes?: string[]; 
    orders_and_remedies?: string;
    
    // References
    cases_cited?: string[]; 
    legal_rules_referenced?: string[]; 
    books_journals_cited?: string[]; 
    
    // Commentary
    commentary?: string;
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
 * Create a new case analysis in database
 * @param baseUrl API base URL
 * @param caseAnalysisData Case analysis data to create
 * @param token Optional authentication token
 * @returns Response data containing the created case analysis
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

    // Prepare data for API by serializing arrays
    const preparedData = prepareAnalysisForApi(caseAnalysisData);

    const response = await axios.post<CaseAnalysisResponse>(
        `${baseUrl}/case-analyses`,
        preparedData,
        { headers }
    );

    // Parse any returned data
    if (response.data.data) {
        if (Array.isArray(response.data.data)) {
            response.data.data = response.data.data.map(parseAnalysisFromApi);
        } else {
            response.data.data = parseAnalysisFromApi(response.data.data);
        }
    }

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

/**
 * Helper function to handle serialization/deserialization of array fields
 * when sending/receiving data from the API
 */
export function prepareAnalysisForApi(analysis: CaseAnalysis): Record<string, any> {
    const prepared: Record<string, any> = { ...analysis };
    
    // Serialize all array fields before sending to API
    if (prepared.coram) prepared.coram = JSON.stringify(prepared.coram);
    if (prepared.counsel) prepared.counsel = JSON.stringify(prepared.counsel);
    if (prepared.area_of_law) prepared.area_of_law = JSON.stringify(prepared.area_of_law);
    if (prepared.subject_index) prepared.subject_index = JSON.stringify(prepared.subject_index);
    if (prepared.catchwords) prepared.catchwords = JSON.stringify(prepared.catchwords);
    if (prepared.issues_for_determination) prepared.issues_for_determination = JSON.stringify(prepared.issues_for_determination);
    if (prepared.holding) prepared.holding = JSON.stringify(prepared.holding);
    if (prepared.important_quotes) prepared.important_quotes = JSON.stringify(prepared.important_quotes);
    if (prepared.cases_cited) prepared.cases_cited = JSON.stringify(prepared.cases_cited);
    if (prepared.legal_rules_referenced) prepared.legal_rules_referenced = JSON.stringify(prepared.legal_rules_referenced);
    if (prepared.books_journals_cited) prepared.books_journals_cited = JSON.stringify(prepared.books_journals_cited);
    
    return prepared;
}

/**
 * Helper function to parse API response and deserialize array fields
 */
export function parseAnalysisFromApi(data: any): CaseAnalysis {
    const parsed = { ...data };
    
    // Parse all serialized array fields
    try {
        if (typeof parsed.coram === 'string') parsed.coram = JSON.parse(parsed.coram);
        if (typeof parsed.counsel === 'string') parsed.counsel = JSON.parse(parsed.counsel);
        if (typeof parsed.area_of_law === 'string') parsed.area_of_law = JSON.parse(parsed.area_of_law);
        if (typeof parsed.subject_index === 'string') parsed.subject_index = JSON.parse(parsed.subject_index);
        if (typeof parsed.catchwords === 'string') parsed.catchwords = JSON.parse(parsed.catchwords);
        if (typeof parsed.issues_for_determination === 'string') parsed.issues_for_determination = JSON.parse(parsed.issues_for_determination);
        if (typeof parsed.holding === 'string') parsed.holding = JSON.parse(parsed.holding);
        if (typeof parsed.important_quotes === 'string') parsed.important_quotes = JSON.parse(parsed.important_quotes);
        if (typeof parsed.cases_cited === 'string') parsed.cases_cited = JSON.parse(parsed.cases_cited);
        if (typeof parsed.legal_rules_referenced === 'string') parsed.legal_rules_referenced = JSON.parse(parsed.legal_rules_referenced);
        if (typeof parsed.books_journals_cited === 'string') parsed.books_journals_cited = JSON.parse(parsed.books_journals_cited);
    } catch (error) {
        console.error('Error parsing serialized fields:', error);
    }
    
    return parsed as CaseAnalysis;
}