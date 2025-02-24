import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../ui/button';
import { EmptyBoard } from './empty-board';
import { BoardCard } from './board-card';

interface BoardListProps {
  groupId: string;
}

export const BoardList = ({ groupId }: BoardListProps) => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const query = {
    search: searchParams.get("search") || "",
    favorites: searchParams.get("favorites") || "",
  };

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const endpoint = query.favorites
          ? `${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/favorites`
          : `${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/list`;
        
        const response = await axios.get(endpoint, {
          params: query.search ? { search: query.search } : undefined
        });
        
        setData(response.data);
      } catch (error) {
        console.error('Error fetching boards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [groupId, query.favorites, query.search]);

  const handleCreateBoard = () => {
    navigate(`/groups/${groupId}/board/new`);
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-3xl">
          {query.favorites ? "Favorite Boards" : "Group Boards"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
          <Button disabled>Create New Board</Button>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="aspect-[100/127] bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.length && query.search) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2>No results found</h2>
        <p>Try searching for something else</p>
      </div>
    );
  }

  if (!data?.length && query.favorites) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2>No favorite boards</h2>
        <p>Try favoriting some boards</p>
      </div>
    );
  }

  if (!data?.length) {
    return <EmptyBoard />;
  }

  return (
    <div>
      <h2 className="text-3xl">
        {query.favorites ? "Favorite Boards" : "Group Boards"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
        <Button onClick={handleCreateBoard}>Create New Board</Button>
        {data.map((board) => (
          <BoardCard
            key={board.id}
            id={board.id}
            groupId={groupId}
            title={board.title}
            imageUrl={board.imageUrl}
            authorId={board.authorId}
            authorName={board.authorName}
            createdAt={board.createdAt}
            isFavorite={board.isFavorite}
          />
        ))}
      </div>
    </div>
  );
};
