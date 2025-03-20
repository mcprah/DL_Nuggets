import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { MdArrowRight } from "react-icons/md";
import { Pagination } from "@nextui-org/react";
import { LoaderFunction, MetaFunction } from "@remix-run/node";
import { getLoaderData } from "~/routes/nuggets.$entity";

interface EntityItem {
  id: number;
  name?: string;
  fullname?: string;
  display_name?: string;
}

interface LoaderData {
  entities: {
    data: EntityItem[];
    meta: {
      current_page: number;
      total: number;
      per_page: number;
    };
  };
  baseUrl: string;
  entityType: string;
  currentPage: number;
  totalPages: number;
  perPage: number;
}

export const meta: MetaFunction = ({ params }) => {
  const { entity } = params;
  const entityTitle = getEntityTitle(entity || "");

  return [
    { title: `${entityTitle} | Dennislaw` },
    {
      name: "description",
      content: `Browse nuggets by ${entityTitle.toLowerCase()}`,
    },
    { name: "og:title", content: `${entityTitle} | Dennislaw` },
    {
      name: "og:description",
      content: `Explore legal principles categorized by ${entityTitle.toLowerCase()}`,
    },
    {
      tagName: "link",
      rel: "canonical",
      href: `https://dennislaw.com/nuggets/${entity}`,
    },
  ];
};

// Helper functions
function getEntityTitle(entityType: string): string {
  switch (entityType) {
    case "courts":
      return "Courts";
    case "judges":
      return "Judges";
    default:
      return "Areas of Law";
  }
}

function getDisplayName(item: EntityItem, entityType: string): string {
  switch (entityType) {
    case "courts":
      return item.name || "";
    case "judges":
      return item.fullname || "";
    default:
      return item.display_name || item.name || "";
  }
}

const EntityIndex = () => {
  const { entity } = useParams();
  const { entities, currentPage, totalPages, perPage, entityType } =
    useLoaderData<LoaderData>();
  const navigate = useNavigate();

  return (
    <div className="">
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 bg-white p-4 shadow-sm rounded-xl border border-black/5">
        {entities.data.map((item) => (
          <Link
            key={item.id}
            to={`/nuggets/${entity}/${item.id}`}
            className="bg-white border border-black/10 flex justify-between p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-all duration-300"
          >
            <p className="text-black">{getDisplayName(item, entityType)}</p>
            <MdArrowRight className="text-xl text-gray-700" />
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            color="primary"
            page={currentPage}
            total={Math.ceil(totalPages / perPage)}
            showControls
            onChange={(page) => navigate(`/nuggets/${entity}?page=${page}`)}
          />
        </div>
      )}
    </div>
  );
};

export default EntityIndex;

export const loader: LoaderFunction = async ({ request, params }) => {
  const loaderData = await getLoaderData(params, request);

  return {
    ...loaderData,
    currentPage: parseInt(loaderData.entities.meta.current_page.toString()),
    totalPages: parseInt(loaderData.entities.meta.total.toString()),
    perPage: parseInt(loaderData.entities.meta.per_page.toString()),
  };
};
