import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Calendar, Search, Zap, Star } from 'lucide-react';
import Navbar from '@/components/Nav_bar';
import { useAuth } from '@/components/providers/auth';

type Group = {
  id: number;
  name: string;
  members: number;
  subject: string;
  nextMeeting: string;
};

// Keeping original mock data
const mockGroups = [
  { id: 1, name: "Quantum Physics Explorers", members: 8, subject: "Physics", nextMeeting: "2023-06-15" },
  { id: 2, name: "Shakespeare's Sonnets Club", members: 12, subject: "Literature", nextMeeting: "2023-06-18" },
  { id: 3, name: "Algorithms & Data Structures", members: 15, subject: "Computer Science", nextMeeting: "2023-06-20" },
  { id: 4, name: "World History Enthusiasts", members: 10, subject: "History", nextMeeting: "2023-06-17" },
];

export default function GroupsPage() {
  const [groups, setGroups] = useState(mockGroups);
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuth();

  const createGroup = (name: string, subject: string, description: string) => {
    const newGroup = {
      id: groups.length + 1,
      name,
      members: 1,
      subject,
      nextMeeting: "TBD"
    };
    setGroups([...groups, newGroup]);
  };

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const timeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  return (
    <div className="min-h-screen bg-background mt-16">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Welcome Section */}
        <div className="mb-12 text-center">
          <div className="relative">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="inline-flex gap-2">
                <Star className="h-5 w-5 text-yellow-500 animate-pulse" />
                <Star className="h-5 w-5 text-yellow-500 animate-pulse delay-100" />
                <Star className="h-5 w-5 text-yellow-500 animate-pulse delay-200" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Unite & Conquer: Join Your Study Squad!
            </h1>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-lg p-8 mb-8 transform hover:scale-102 transition-transform">
              <p className="text-2xl font-medium mb-2">
                Good {timeOfDay()}, {user?.name || 'Scholar'}! 🌟
              </p>
              <p className="text-muted-foreground">
                Ready to ace your studies? Your study squad awaits!
              </p>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-lg bg-primary/5 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>Learn Together</span>
              </div>
              <div className="p-4 rounded-lg bg-secondary/5 flex items-center gap-3">
                <Users className="h-5 w-5 text-secondary" />
                <span>Grow Together</span>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary" />
                <span>Succeed Together</span>
              </div>
            </div> */}

{/* <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
          <p className="text-lg text-center">
            "Coming together is a beginning. Keeping together is progress. Working together is success." 
            <span className="block mt-2  text-primary font-semibold">- Henry Ford</span>
          </p>
        </div> */}
          </div>
        </div>

        {/* Rest of the content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex gap-4 w-full md:w-auto">
            <CreateGroupDialog onCreateGroup={createGroup} />
            <JoinGroupDialog />
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CreateGroupDialog({ onCreateGroup}: { onCreateGroup: (name: string, subject: string, description: string) => void }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateGroup(name, subject, description);
    setName('');
    setSubject('');
    setDescription('');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-gradient-to-r from-primary to-primary hover:opacity-90">
          <Zap className="mr-2 h-4 w-4" /> Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Study Group</DialogTitle>
          <DialogDescription>
            Fill in the details to create your new study group.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your study group"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Group</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function JoinGroupDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">Join Group</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a Study Group</DialogTitle>
          <DialogDescription>
            Enter the group code to join an existing study group.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="groupCode">Group Code</Label>
            <Input id="groupCode" placeholder="Enter group code" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Join Group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GroupCard({ group } : { group: Group }) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <CardTitle>{group.name}</CardTitle>
        <CardDescription className="text-white/90">{group.subject}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Users size={16} />
            <span>{group.members} members</span>
          </div>
          <Badge variant="secondary">{group.subject}</Badge>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
          <Calendar size={16} />
          <span>Next meeting: {group.nextMeeting}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full hover:bg-primary/5">
          <BookOpen className="mr-2 h-4 w-4" /> View Group
        </Button>
      </CardFooter>
    </Card>
  );
}