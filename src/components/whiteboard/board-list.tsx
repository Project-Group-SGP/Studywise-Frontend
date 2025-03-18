import { useEffect, useState } from 'react';
import {  useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { EmptyBoard, EmptyFavorites, EmptySearch } from './empty-board';
import { BoardCard } from './board-card';
import { NewBoardButton } from './new-board-button';

interface BoardListProps {
  groupId: string;
}

export const BoardList = ({ groupId }: BoardListProps) => {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const query = {
    search: searchParams.get("Search") || "",
    favorites: searchParams.get("favorites") || "",
  };

  useEffect(() => {
    searchParams.delete("fetch");
    const fetchBoards = async () => {
      try {
        const endpoint = query.favorites
          ? `${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/favorites`
          : `${import.meta.env.VITE_API_URL}/api/groups/${groupId}/board/list`;
        
        const response = await axios.get(endpoint, {
          params: {
            search: query.search,
          },
          withCredentials: true,
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

  
  if (loading) {
    return (
      <div>
        <h2 className="text-3xl">
          {query.favorites ? "Favorite Boards" : "Group Boards"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
          <NewBoardButton  groupId={groupId} disabled/>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="aspect-[100/127] bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if(data.length === 0 && !!query.favorites) {
    return (
      <EmptyFavorites/>
    )
  }
  
  if(data.length === 0 && !!query.search) {
    return (
      <EmptySearch/>
    )
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
        <NewBoardButton  groupId={groupId}/>
        {data.map((board) => (
          <BoardCard
            key={board.id}
            id={board.id}
            groupId={groupId}
            title={board.title}
            imageurl={board.imageUrl}
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
