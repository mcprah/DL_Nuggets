import axios from "axios";

/**
 * Records a view for a specific nugget
 * @param nuggetId - The ID of the nugget being viewed
 * @param baseUrl - The base URL for the API
 * @returns Promise that resolves when the view is recorded
 */
export const recordNuggetView = async (
  nuggetId: number,
  baseUrl: string
): Promise<void> => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("access_token");
    if (!token || !nuggetId) return;

    // Record the view
    await axios.post(
      `${baseUrl}/record-nugget-view`,
      { nugget_id: nuggetId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error recording nugget view:", error);
  }
};

/**
 * Records a resource access in the backend
 *
 * @param baseUrl The base URL for the API
 * @param resourceType The type of resource ('area_of_law', 'court', or 'judge')
 * @param resourceId The ID of the resource
 * @returns Promise with the response data
 */
export const recordResourceAccess = async (
  baseUrl: string,
  resourceType: "area_of_law" | "court" | "judge",
  resourceId: number | string
): Promise<any> => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await axios.post(
      `${baseUrl}/resource-access`,
      {
        resource_type: resourceType,
        resource_id: resourceId,
      },
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined
    );

    return response.data;
  } catch (error) {
    // Silently handle errors to prevent disrupting the user experience
    console.error("Error recording resource access:", error);
    return null;
  }
};

// You can add other API utility functions here as needed
