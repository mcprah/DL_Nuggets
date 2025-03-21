import { useNavigate } from "@remix-run/react";
import { Nugget } from "./NuggetDrawer";
import { Divider } from "@nextui-org/react";

interface NuggetCardProps {
  nugget: Nugget;
  isSelected?: boolean;
  onClick: (nugget: Nugget) => void;
  className?: string;
  detailsPath?: string | null;
}

/**
 * Helper function to parse keywords from different formats
 */
const parseKeywords = (keywords: any): any[] => {
  // If it's already an array, return it
  if (Array.isArray(keywords)) {
    return keywords;
  }

  // If it's a string that looks like JSON, try to parse it
  if (
    typeof keywords === "string" &&
    (keywords.startsWith("[") || keywords.startsWith("{"))
  ) {
    try {
      const parsed = JSON.parse(keywords);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      // If parsing fails, split by comma
      return keywords
        .replace(/[\[\]"]/g, "")
        .split(",")
        .map((k) => k.trim());
    }
  }

  // If it's a comma-separated string
  if (typeof keywords === "string") {
    return keywords.split(",").map((k) => k.trim());
  }

  // Default: return an empty array
  return [];
};

export default function NuggetCard({
  nugget,
  isSelected = false,
  onClick,
  className = "",
  detailsPath = null,
}: NuggetCardProps) {
  const navigate = useNavigate();

  // Parse keywords to ensure they're in a usable format
  const keywordsList = parseKeywords(nugget.keywords);

  return (
    <div
      className={`p-4 rounded-xl shadow-md cursor-pointer transition-all duration-300 ${
        isSelected
          ? "border border-2 border-slate-600 bg-slate-600 text-white shadow-md"
          : "bg-slate-50 hover:bg-slate-100 hover:shadow-lg"
      } ${className}`}
      onClick={() => {
        detailsPath ? navigate(detailsPath) : onClick(nugget);
      }}
    >
      <p
        className={`font-semibold line-clamp-3 ${
          isSelected ? "text-white" : ""
        }`}
      >
        {nugget.headnote || nugget.title}
      </p>
      <p
        className={`text-sm mt-1 line-clamp-3 ${
          isSelected ? "text-slate-200" : "text-gray-600"
        }`}
      >
        {nugget.principle}
      </p>

      <Divider className={`my-5 ${isSelected ? "bg-slate-400" : ""}`} />

      <div className="mt-4 flex justify-between items-center">
        <span
          className={`text-xs truncate max-w-[70%] ${
            isSelected ? "text-slate-300" : "text-gray-500"
          }`}
        >
          {nugget.dl_citation_no || nugget.citation_no || "No citation"}
        </span>

        {(nugget.judge || nugget.judges) && (
          <span
            className={`text-xs italic ${
              isSelected ? "text-slate-300" : "text-gray-500"
            }`}
          >
            {nugget.judge?.fullname || nugget.judges} {nugget.judge_title}
          </span>
        )}
      </div>

      {keywordsList.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {keywordsList.slice(0, 2).map((keyword, idx) => {
            // Handle different keyword formats
            const keywordText =
              typeof keyword === "object"
                ? keyword?.keyword?.value ||
                  keyword?.value ||
                  JSON.stringify(keyword)
                : keyword;

            return (
              <span
                key={idx}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isSelected ? "bg-slate-500 text-white" : "bg-slate-200"
                }`}
              >
                {keywordText}
              </span>
            );
          })}
          {keywordsList.length > 2 && (
            <span
              className={`text-xs ${
                isSelected ? "text-slate-300" : "text-gray-500"
              }`}
            >
              +{keywordsList.length - 2} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
