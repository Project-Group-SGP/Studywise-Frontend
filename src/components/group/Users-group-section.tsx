import { Group, JoinRequest } from "../../type";
import { GroupCard } from "./Group-card";
import { Skeleton } from "@/components/ui/skeleton";

interface GroupSectionProps {
  title: string;
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  request: JoinRequest[];
  setRequest: React.Dispatch<React.SetStateAction<JoinRequest[]>>;
}
 
export function UserGroupSection({
  title,
  groups,
  isLoading,
  error,
  request,
  setRequest
}: GroupSectionProps) {
  // Create a map to count requests by groupId
  const requestByGroupId = request.reduce((acc, req) => {
    if (!acc[req.groupId]) {
      acc[req.groupId] = [];
    }
    acc[req.groupId].push(req);
    return acc;
  }, {} as Record<string, JoinRequest[]>);

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
            <GroupCard
              key={group.id}
              group={group}
              isOwner={true}
              isRequest={(requestByGroupId[group.id] || []).length} // Pass the count of requests for this group
              requests={requestByGroupId[group.id] || []} // Pass the filtered requests for this group
              setRequest={setRequest}
            />
          ))}
        </div>
      ) : (
        <p>No groups found.</p>
      )}
    </div>
  );
}
