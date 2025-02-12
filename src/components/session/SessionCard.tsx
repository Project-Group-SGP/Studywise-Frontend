import { Edit2, Play, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useAuth } from "../providers/auth";
import { useSession } from "@/contexts/SessionContext";
import { SessionType } from "./Session";
import { format } from "date-fns";
import { toast } from "sonner";

// Add new SessionCard component
const SessionCard = ({
  session,
  onEdit,
  onDelete,
}: {
  session: SessionType;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { user } = useAuth();
  const { startSession, joinSession } = useSession();

  const handleDelete = async () => {
    try {
      await onDelete();
      toast.success("Session deleted successfully", {
        duration: 2000,
        icon: true,
      });
    } catch (error) {
      toast.error("Failed to delete session", {
        duration: 2000,
        icon: true,
      });
    }
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{session.name}</CardTitle>
            <CardDescription>
              {format(new Date(session.time), "PPP 'at' p")}
            </CardDescription>
            <p className="mt-2 text-sm text-muted-foreground">
              {session.description}
            </p>
            {session.prerequisites && (
              <p className="mt-1 text-sm">
                <strong>Prerequisites:</strong> {session.prerequisites}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {session.creatorID === user?.id && (
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={onEdit}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
            {session.isStarted
              ? session.creatorID !== user?.id && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => joinSession(session.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Join Session
                  </Button>
                )
              : session.creatorID === user?.id && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => startSession(session.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Session
                  </Button>
                )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default SessionCard;
