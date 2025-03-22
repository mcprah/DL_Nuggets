import axios from "axios";
import { CaseDigestResponse } from "~/types/CaseDigest";


export async function storeVectorFileIDs(
    vector_store_id?: string,
    vector_file_id?: string,
    dl_citation_no?: string,
    token?: string,
) {
    const baseUrl = process.env.NEXT_PUBLIC_DL_LIVE_URL;

    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const payload = {
            "dl_citation_no": vector_store_id,
            "vector_file_id": vector_file_id,
            "vector_store_id": dl_citation_no
        };

        const response = await axios.post(
            `${baseUrl}/case-digests/vectorize`,
            payload,
            { headers }
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching case digest:", error);
        throw error;
    }
}
