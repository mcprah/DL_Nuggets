import axios from "axios";

/**
 * Records a view for a specific nugget
 * @param nuggetId - The ID of the nugget being viewed
 * @param baseUrl - The base URL for the API
 * @returns Promise that resolves when the view is recorded
 */
export const recordNuggetView = async (nuggetId: number, baseUrl: string): Promise<void> => {
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

// You can add other API utility functions here as needed