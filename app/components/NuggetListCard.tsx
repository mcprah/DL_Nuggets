import { Nugget } from "./NuggetDrawer";
import { Button } from "@nextui-org/react";
import { MdEdit, MdDelete } from "react-icons/md";

interface NuggetListCardProps {
  nugget: Nugget;
  onView: (nugget: Nugget) => void;
  onEdit?: (nugget: Nugget) => void;
  onDelete?: (nuggetId: number) => void;
  className?: string;
}

export default function NuggetListCard({
  nugget,
  onView,
  onEdit,
  onDelete,
  className = "",
}: NuggetListCardProps) {
  return (
    <div
      className={`h-full shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex justify-between overflow-hidden p-3 pb-0">
        <div className="truncate max-w-[70%]">
          <p className="text-sm text-gray-500 truncate">
            {nugget.citation_no || nugget.dl_citation_no || "No citation"}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          {nugget.year && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs whitespace-nowrap">
              {nugget.year}
            </span>
          )}
        </div>
      </div>

      <div className="cursor-pointer p-3 pt-1" onClick={() => onView(nugget)}>
        <h3 className="font-semibold line-clamp-2 mb-2 text-sm sm:text-base">
          {nugget.headnote || nugget.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">
          {nugget.principle}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 p-3 pt-0">
        {(onEdit || onDelete) && (
          <div className="flex gap-2 w-full sm:w-auto">
            {onEdit && (
              <Button
                size="sm"
                isIconOnly
                variant="light"
                color="primary"
                onPress={() => {
                  onEdit(nugget);
                }}
              >
                <MdEdit />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                isIconOnly
                variant="light"
                color="danger"
                onPress={() => {
                  onDelete(nugget.id);
                }}
              >
                <MdDelete />
              </Button>
            )}
          </div>
        )}
        <Button
          size="sm"
          variant="flat"
          color="primary"
          className="w-full sm:w-auto"
          onPress={() => {
            onView(nugget);
          }}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
