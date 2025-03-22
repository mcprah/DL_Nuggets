import axios from "axios";
import { CaseDigestResponse } from "~/types/CaseDigest";


export async function generateCaseDigest(
    token?: string,
    caseData?: Record<string, any>
) {
    const baseUrl = process.env.NEXT_PUBLIC_DL_AI_API_URL;

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
    dlCitationNo: string,
    token?: string
) {
    const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;

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

        // The API returns { success: boolean, data: CaseDigestResponse } format
        if (response.data.success) {
            return response.data.data;
        } else {
            return response.data
        }
    } catch (error) {
        console.error(`Error fetching case digest for DL citation ${dlCitationNo}:`, error);
        throw error;
    }
}


export async function getCaseDigestFromAI(
    vector_store_id: string,
    dl_citation_no: string,
    token?: string
) {
    const baseUrl = process.env.NEXT_PUBLIC_DL_AI_API_URL;

    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        // URL-encode the citation number to handle special characters
        const encodedCitation = encodeURIComponent(dl_citation_no);
        const payload = {
            "vector_store_id": vector_store_id,
            "dl_citation_no": encodedCitation
        }

        const response = await axios.post<CaseDigestResponse>(
            `${baseUrl}/cases/get-case-digest`,
            payload,
            { headers }
        );

        // Handle the response based on your API structure
        // If the API returns { success: boolean, data: ... } format:
        if (response.data.success) {
            return response.data.data;
        }

        // If the API returns the data directly:
        return response.data;
    } catch (error) {
        console.error(`Error retrieving case digest from AI for citation ${dl_citation_no}:`, error);
        throw error;
    }
}