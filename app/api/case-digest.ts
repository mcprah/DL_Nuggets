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