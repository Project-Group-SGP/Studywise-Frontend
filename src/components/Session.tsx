import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";


const groupData = {
  id: '1',
  name: 'Quantum Physics Explorers',
  description: 'A group dedicated to exploring the fascinating world of quantum physics.',
  owner: {
    id: 'owner1',
    name: 'Dr. Alice Cooper',
    avatar: '/api/placeholder/150/150'
  },
  members: [
    { id: 'member1', name: 'Bob Smith', avatar: '/api/placeholder/150/150', points: 120 },
    { id: 'member2', name: 'Charlie Brown', avatar: '/api/placeholder/150/150', points: 95 },
    { id: 'member3', name: 'Diana Prince', avatar: '/api/placeholder/150/150', points: 150 },
    { id: 'member4', name: 'Ethan Hunt', avatar: '/api/placeholder/150/150', points: 80 },
  ],
  chatMessages: [
    { id: 'msg1', sender: 'Bob Smith', content: 'Hey everyone, excited for our next session!', timestamp: '2023-06-10T10:00:00Z' },
    { id: 'msg2', sender: 'Dr. Alice Cooper', content: 'We\'ll be covering quantum entanglement.', timestamp: '2023-06-10T10:05:00Z' },
    { id: 'msg3', sender: 'Charlie Brown', content: 'Can\'t wait to learn more about it!', timestamp: '2023-06-10T10:10:00Z' },
  ],
  upcomingSessions: [
    { id: 'session1', title: 'Quantum Entanglement Basics', date: '2023-06-15T14:00:00Z', duration: 90 },
    { id: 'session2', title: 'Schrödinger\'s Cat Paradox', date: '2023-06-20T15:00:00Z', duration: 120 },
  ],
  groupProgress: 65,
};

const Session = () => {

  const [sessions, setSessions] = useState(groupData.upcomingSessions);

  const addSession = (title : string, date: string, duration: number) => {
    const newSession = {
      id: `session${sessions.length + 1}`,
      title,
      date,
      duration
    };
    setSessions([...sessions, newSession]);
  };

  return (
    <Card>
    <CardHeader>
      <CardTitle>Study Sessions</CardTitle>
      <CardDescription>Plan your study time together!</CardDescription>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[300px] mb-4">
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle>{session.title}</CardTitle>
                <CardDescription>
                  {new Date(session.date).toLocaleString()} ({session.duration} minutes)
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </CardContent>
    <CardFooter>
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Study Session
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Study Session</DialogTitle>
            <DialogDescription>Plan your next study session!</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Topic</Label>
              <Input id="title" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">When?</Label>
              <Input id="date" type="datetime-local" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">How Long?</Label>
              <Input id="duration" type="number" className="col-span-3" placeholder="Duration in minutes" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => {
              const title = (document.getElementById('title') as HTMLInputElement).value;
              const date = (document.getElementById('date') as HTMLInputElement).value;
              const duration = parseInt((document.getElementById('duration') as HTMLInputElement).value);
              addSession(title, date, duration);
            }}>Schedule It!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardFooter>
  </Card>
  )
}

export default Session