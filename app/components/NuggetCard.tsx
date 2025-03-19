import { useNavigate } from "@remix-run/react";
import { Nugget } from "./NuggetDrawer";

interface NuggetCardProps {
  nugget: Nugget;
  isSelected?: boolean;
  onClick: (nugget: Nugget) => void;
  className?: string;
  detailsPath?: string | null;
}

export default function NuggetCard({
  nugget,
  isSelected = false,
  onClick,
  className = "",
  detailsPath = null,
}: NuggetCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`p-4 border rounded-lg bg-gray-50 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md ${
        isSelected ? "border-primary" : "hover:bg-gray-100"
      } ${className}`}
      onClick={() => {
        detailsPath ? navigate(detailsPath) : onClick(nugget);
      }}
    >
      {/* <div className="flex justify-between items-start mb-2">
        <span className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded-full">
          {nugget.status || "Published"}
        </span>
        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full whitespace-nowrap">
          {nugget.year}
        </span>
      </div> */}

      <p className="font-semibold line-clamp-3">
        {nugget.headnote || nugget.title}
      </p>
      <p className="text-sm mt-1 line-clamp-3 text-gray-600">
        {nugget.principle}
      </p>

      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-500 truncate max-w-[70%]">
          {nugget.dl_citation_no || nugget.citation_no || "No citation"}
        </span>

        {nugget.judge && (
          <span className="text-xs text-gray-500 italic">
            {nugget.judge.fullname} {nugget.judge_title}
          </span>
        )}
      </div>

      {nugget.keywords && nugget.keywords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {nugget.keywords.slice(0, 2).map((keywordObj, idx) => (
            <span
              key={idx}
              className="text-xs bg-gray-100 px-2 py-0.5 rounded-full"
            >
              {keywordObj?.keyword?.value || "No keywords"}
            </span>
          ))}
          {nugget.keywords.length > 2 && (
            <span className="text-xs text-gray-500">
              +{nugget.keywords.length - 2} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
