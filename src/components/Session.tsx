import { Plus, Play, CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSession } from "@/contexts/SessionContext";
import { useState } from "react";


interface SessionFormData {
  title: string;
  description: string;
  date: Date;
  time: string;
  maxParticipants?: number;
  prerequisites?: string;
  meetingLink?: string;
}


const Session = () => {
  const { sessions, activeSessions, addSession, startSession, endSession } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState<SessionFormData>({
    title: "",
    description: "",
    date: new Date(),
    time: format(new Date(), "HH:mm"),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    const [hours, minutes] = formData.time.split(':');
    const sessionDate = new Date(date);
    sessionDate.setHours(parseInt(hours), parseInt(minutes));

    addSession({
      title: formData.title,
      date: sessionDate.toISOString(),
      description: formData.description,
      prerequisites: formData.prerequisites,
      // meetingLink: formData.meetingLink,
      createdBy: {
        id: 'current-user-id', // Replace with actual user ID
        name: 'Current User', // Replace with actual user name
      },
    });

    setIsDialogOpen(false);
    setFormData({
      title: "",
      description: "",
      date: new Date(),
      time: format(new Date(), "HH:mm"),
    });
  };

  return (
    <div className="relative">
      <Card>
        <CardHeader>
          <CardTitle>Study Sessions</CardTitle>
          <CardDescription>Plan your study time together!</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] mb-4">
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CardDescription>
                          {format(new Date(session.date), "PPP 'at' p")}
                        </CardDescription>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {session.description}
                        </p>
                        {session.prerequisites && (
                          <p className="mt-1 text-sm">
                            <strong>Prerequisites:</strong> {session.prerequisites}
                          </p>
                        )}
                        {session.maxParticipants && (
                          <p className="mt-1 text-sm">
                            <strong>Max Participants:</strong> {session.maxParticipants}
                          </p>
                        )}
                      </div>
                      {!session.isActive && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => startSession(session.id)}
                          className="hover:scale-105 transition-transform"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Session
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create Study Session</DialogTitle>
                  <DialogDescription>
                    Plan a new study session for your group
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Session Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Advanced Calculus Review"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Date & Time</Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-[120px]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="What will you study in this session?"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="prerequisites">Prerequisites (Optional)</Label>
                    <Input
                      id="prerequisites"
                      name="prerequisites"
                      value={formData.prerequisites}
                      onChange={handleInputChange}
                      placeholder="e.g., Basic calculus knowledge"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="maxParticipants">Max Participants (Optional)</Label>
                    <Input
                      type="number"
                      id="maxParticipants"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
                    <Input
                      id="meetingLink"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleInputChange}
                      placeholder="e.g., Zoom or Google Meet link"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Session</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Session;