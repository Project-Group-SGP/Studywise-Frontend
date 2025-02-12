import { SessionType } from "./Session";
import SessionCard from "./SessionCard";

interface SessionListProps {
  title: string;
  sessions: SessionType[];
  onEdit: (session: SessionType) => void;
  onDelete: (id: string) => void;
}

export const SessionList = ({ title, sessions, onEdit, onDelete }: SessionListProps) => {
  return (
    <>
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onEdit={() => onEdit(session)}
            onDelete={() => onDelete(session.id)}
          />
        ))}
      </div>
    </>
  );
}; 