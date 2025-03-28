import axios from "axios";
import { CaseDigestResponse } from "~/types/CaseDigest";

export async function storeVectorFileIDs(
    baseUrl: string,
    vector_store_id?: string,
    vector_file_id?: string,
    dl_citation_no?: string,
    token?: string,
) {

    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const payload = {
            "dl_citation_no": dl_citation_no,
            "vector_file_id": vector_file_id,
            "vector_store_id": vector_store_id
        };

        console.log("store payload", payload);
        const response = await axios.post(
            `${baseUrl}/case-digests/vectorize`,
            payload,
            { headers }
        );
        console.log("response from storeVectorFileIDs", response.data);
        

        return response.data;
    } catch (error) {
        console.error("Error fetching case digest:", error);
        throw error;
    }
}
