"use client";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useLocation } from "react-router";
import { useNavigate } from "react-router";
import { toast } from "sonner";
export const NewBoardButton = ({groupId,disabled}:{groupId:string;disabled?:boolean}) => {
  const navigate = useNavigate();
  const { mutate, isLoading } = useApiMutation(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/create`);
  const location = useLocation();
  const onClick = () => {
      mutate({ title: "Untitled" })
          .then((id) => {
              toast.success("Board created");
              const currentPath = location.pathname;
              console.log("BOARD:",{id});
              const boardPath = `${currentPath}/board/${id.id}`;
              
              navigate(boardPath);
          })
          .catch((e) => {
              console.log("Error :",e);
              toast.error("Failed to create board");
          });
  };
  
  return (
    <button
      disabled={disabled||isLoading}
      onClick={onClick}
      className={cn(
        "w-full h-full col-span-1 aspect-[100/27] bg-blue-600 rounded-lg hover:bg-blue-800 flex flex-col items-center justify-center py-6"
      , (disabled || isLoading)&& "hover:bg-blue-600 cursor-not-allowed opacity-75")}
    >
      <div />
      <Plus className="h-12 w-12 text-white stroke-1"/>
      <p className="text-xs text-white font-light">
        New board
      </p>
    </button>
  )
}