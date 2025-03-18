import { useApiMutation } from "@/hooks/use-api-mutation";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useLocation } from "react-router";

export const EmptyBoard = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { mutate, isLoading } = useApiMutation(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/create`);
  const location = useLocation();

  const onClick = () => {
      mutate({ title: "Untitled" })
          .then((id) => {
              toast.success("Board created");
              const currentPath = location.pathname;
              const boardPath = `${currentPath}/board/${id}`;
              
              navigate(boardPath);
          })
          .catch((e) => {
              console.log("Error :",e);
              toast.error("Failed to create board");
          });
  };

  return (
      <div className="h-full flex flex-col items-center justify-center">
          <img src="/notes.svg" alt="Empty" width={140} height={140} />
          <h2 className="text-2xl font-semibold mt-6">Create your first board!</h2>
          <p className="text-muted-foreground text-sm mt-2">Start by creating a board for your organization</p>
          <div className="mt-6">
              <Button disabled={isLoading} size="lg" onClick={onClick}>
                  Create board
              </Button>
          </div>
      </div>
  );
};


export const EmptySearch = () => {
  return (
      <div className="h-full flex flex-col items-center justify-center">
          <img src="/empty-search.svg" alt="Empty" width={140} height={140} />
          <h2 className="text-2xl font-semibold mt-6">No results found!</h2>
          <p className="text-muted-foreground text-sm mt-2">Try searching for something else</p>
      </div>
  );
};

export const EmptyFavorites = () => {
  return (
      <div className="h-full flex flex-col items-center justify-center">
          <img src="/empty-favorites.svg" alt="Empty" width={140} height={140} />
          <h2 className="text-2xl font-semibold mt-6">No favorite boards!</h2>
          <p className="text-muted-foreground text-sm mt-2">Try favoriting some boards</p>
      </div>
  );
};

