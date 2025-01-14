import { Group } from "../../type";
import { GroupCard } from "./Group-card";
import { Skeleton } from "@/components/ui/skeleton";

interface GroupSectionProps {
  title: string;
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  isOwner: boolean;
}

export function GroupSection({
  title,
  groups,
  isLoading,
  error,
  isOwner
}: GroupSectionProps) {
  console.log("inside GroupSection");

  // console.log("groups:", groups);
  // console.log(typeof groups);
  // console.log(Array.isArray(groups));
  
  // groups.map((group) => {    
  //   console.log("group:", group);
  //   console.log(typeof group);
  //   console.log(Array.isArray(group));
  // });

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(1)].map((_, index) => (
            <Skeleton key={index} className="h-[200px] w-full" />
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} isOwner={isOwner} />
          ))}
        </div>
      ) : (
        <p>No groups found.</p>
      )}
    </div>
  );
}
