import { useLoaderData, useParams } from "@remix-run/react";
import { MetaFunction, LoaderFunction, json } from "@remix-run/node";
import MostAccessed from "~/components/MostAccessed";
import AdminLayout from "../Layout/AdminLayout";

export const meta: MetaFunction = ({ params }) => {
  const typeTitle =
    params.type === "area-of-law"
      ? "Areas of Law"
      : params.type === "court"
      ? "Courts"
      : params.type === "judge"
      ? "Judges"
      : "Resources";

  return [
    { title: `Most Popular ${typeTitle} | Dennislaw` },
    {
      name: "description",
      content: `Explore the most popular ${typeTitle.toLowerCase()} based on user activity.`,
    },
  ];
};

// Server loader to provide base URL
export const loader: LoaderFunction = async () => {
  return json({
    baseUrl: process.env.NEXT_PUBLIC_DL_LIVE_URL,
  });
};

export default function MostAccessedPage() {
  const { baseUrl } = useLoaderData<{ baseUrl: string }>();
  const params = useParams();

  // Convert URL parameter to API parameter
  const getApiType = (urlType: string | undefined): string => {
    switch (urlType) {
      case "area-of-law":
        return "area_of_law";
      case "court":
        return "court";
      case "judge":
        return "judge";
      default:
        return "all";
    }
  };

  const apiType = getApiType(params.type);

  // Get the page title based on the type
  const getPageTitle = (type: string): string => {
    switch (type) {
      case "area_of_law":
        return "Most Popular Areas of Law";
      case "court":
        return "Most Popular Courts";
      case "judge":
        return "Most Popular Judges";
      default:
        return "Most Popular Resources";
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{getPageTitle(apiType)}</h1>
        <p className="text-gray-600 mb-8">
          Browse the most accessed{" "}
          {apiType === "area_of_law"
            ? "areas of law"
            : apiType === "court"
            ? "courts"
            : apiType === "judge"
            ? "judges"
            : "resources"}
          based on user activity.
        </p>

        <MostAccessed
          baseUrl={baseUrl}
          limit={20}
          showTitle={false}
          type={apiType as "area_of_law" | "court" | "judge" | "all"}
        />
      </div>
    </AdminLayout>
  );
}
