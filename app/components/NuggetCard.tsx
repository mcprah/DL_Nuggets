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
      className={`p-4 rounded-xl shadow-md cursor-pointer transition-all duration-300 ${
        isSelected 
          ? "border border-2 border-slate-600 bg-slate-600 text-white shadow-md" 
          : "bg-slate-50 hover:bg-slate-100 hover:shadow-lg"
      } ${className}`}
      onClick={() => {
        detailsPath ? navigate(detailsPath) : onClick(nugget);
      }}
    >
      <p className={`font-semibold line-clamp-3 ${isSelected ? "text-white" : ""}`}>
        {nugget.headnote || nugget.title}
      </p>
      <p className={`text-sm mt-1 line-clamp-3 ${isSelected ? "text-slate-200" : "text-gray-600"}`}>
        {nugget.principle}
      </p>

      <Divider className={`my-5 ${isSelected ? "bg-slate-400" : ""}`} />

      <div className="mt-4 flex justify-between items-center">
        <span className={`text-xs truncate max-w-[70%] ${isSelected ? "text-slate-300" : "text-gray-500"}`}>
          {nugget.dl_citation_no || nugget.citation_no || "No citation"}
        </span>

        {nugget.judge && (
          <span className={`text-xs italic ${isSelected ? "text-slate-300" : "text-gray-500"}`}>
            {nugget.judge.fullname} {nugget.judge_title}
          </span>
        )}
      </div>

      {nugget.keywords && nugget.keywords.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1">
          {nugget.keywords.slice(0, 2).map((keywordObj, idx) => (
            <span
              key={idx}
              className={`text-xs px-2 py-0.5 rounded-full ${
                isSelected ? "bg-slate-500 text-white" : "bg-slate-200"
              }`}
            >
              {keywordObj?.keyword?.value || "No keywords"}
            </span>
          ))}
          {nugget.keywords.length > 2 && (
            <span className={`text-xs ${isSelected ? "text-slate-300" : "text-gray-500"}`}>
              +{nugget.keywords.length - 2} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
