import { useLoaderData } from "@remix-run/react";
import { MetaFunction, LoaderFunction, json } from "@remix-run/node";
import MostAccessed from "~/components/MostAccessed";
import AdminLayout from "../Layout/AdminLayout";

export const meta: MetaFunction = () => {
  return [
    { title: "Most Popular Resources | Dennislaw" },
    {
      name: "description",
      content:
        "Explore the most popular legal resources based on user activity.",
    },
  ];
};

// Server loader to provide base URL
export const loader: LoaderFunction = async () => {
  return json({
    baseUrl: process.env.NEXT_PUBLIC_DL_LIVE_URL,
  });
};

export default function MostAccessedAllPage() {
  const { baseUrl } = useLoaderData<{ baseUrl: string }>();

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Most Popular Resources</h1>
        <p className="text-gray-600 mb-8">
          Browse the most accessed resources across all categories based on user
          activity.
        </p>

        <MostAccessed
          baseUrl={baseUrl}
          limit={20}
          showTitle={false}
          type="all"
        />
      </div>
    </AdminLayout>
  );
}
