import { useApiMutation } from '@/hooks/use-api-mutation';
import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';


interface BoardCardProps {
  id: string;
  groupId: string;
  title: string;
  imageUrl: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  isFavorite: boolean;
}

export const BoardCard = ({
  id,
  groupId,
  title,
  imageUrl,
  authorId,
  authorName,
  createdAt,
  isFavorite
}: BoardCardProps) => {
  const { mutate: toggleFavorite } = useApiMutation(
    `/api/groups/${groupId}/board/${id}/${isFavorite ? 'unfavorite' : 'favorite'}`
  );

  const onFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleFavorite({})
      .then(() => {
        toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
      })
      .catch(() => {
        toast.error("Failed to update favorite");
      });
  };

  return (
    <Link to={`/groups/${groupId}/board/${id}`}>
      <div className="group aspect-[100/127] border rounded-lg flex flex-col justify-between overflow-hidden">
        <div className="relative flex-1 bg-amber-50">
          <img
            src={imageUrl}
            alt={title}
            className="object-fit absolute inset-0"
          />
          <button
            onClick={onFavorite}
            className="absolute top-1 right-1 px-3 py-2 rounded-full bg-white/80 hover:bg-white"
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </div>
        <div className="p-3">
          <p className="text-sm truncate">{title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {authorName} • {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
};