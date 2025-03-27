import axios from "axios";
import { CaseDigest, CaseDigestResponse } from "~/types/CaseDigest";


export async function generateCaseDigest(
    baseUrl: string,
    caseData?: Record<string, any>,
    token?: string,
) {

    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const payload = {
            ...(caseData || {})
        };

        const response = await axios.post<CaseDigestResponse>(
            `${baseUrl}/cases/digest`,
            payload,
            { headers }
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching case digest:", error);
        throw error;
    }
}


export async function getCaseDigestByDlCitationFromDB(
    baseUrl: string,
    dlCitationNo: string,
    token?: string
) {

    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        // URL-encode the citation number to handle special characters
        const encodedCitation = encodeURIComponent(dlCitationNo);

        const response = await axios.get(
            `${baseUrl}/case-digests/${encodedCitation}`,
            { headers }
        );

        // The API returns { success: boolean, data: CaseDigest } format
        if (response.data.success) {
            return response.data.data;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error fetching case digest for DL citation ${dlCitationNo}:`, error);
        return null;
    }
}


export async function getCaseDigestFromAI(
    baseUrl: string,
    vector_store_id: string,
    dl_citation_no: string,
    token?: string
) {
    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        // URL-encode the citation number to handle special characters

        console.log(dl_citation_no);
        
        const payload = {
            "vector_store_id": vector_store_id,
            "dl_citation_no": dl_citation_no
        }

        const response = await axios.post<CaseDigestResponse>(
            `${baseUrl}/cases/get-case-digest`,
            payload,
            { headers }
        );

        // Handle the response based on your API structure
        // If the API returns { success: boolean, data: ... } format:
        if (response.data.success) {
            return response.data.data as CaseDigest;
        }

        // If the API returns the data directly:
        return response.data;
    } catch (error) {
        console.error(`Error retrieving case digest from AI for citation ${dl_citation_no}:`, error);
        throw error;
    }
}

/**
 * Store case digest data in the database
 * @param baseUrl API base URL
 * @param caseDigest The case digest data to store
 * @param token Authentication token
 * @returns Response data from the API
 */
export async function storeCaseDigest(
    baseUrl: string,
    caseDigest: CaseDigest,
    token?: string,
) {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.post(
            `${baseUrl}/case-digests`,
            caseDigest,
            { headers }
        );

        console.log("Case digest stored successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error storing case digest:", error);
        throw error;
    }
}
