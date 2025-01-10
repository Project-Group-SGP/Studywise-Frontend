import { ScrollArea } from "@radix-ui/react-scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Crown } from 'lucide-react';

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

const Member = () => {
  return (
    <Card>
    <CardHeader>
      <CardTitle>Study Buddies</CardTitle>
      <CardDescription>Your awesome study group members!</CardDescription>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={groupData.owner.avatar} alt={groupData.owner.name} />
              <AvatarFallback>{groupData.owner.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{groupData.owner.name}</p>
              <p className="text-sm text-muted-foreground">Group Leader</p>
            </div>
            <Crown className="h-4 w-4 text-yellow-500" />
          </div>
          {groupData.members.map((member) => (
            <div key={member.id} className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">Study Buddy</p>
              </div>
              <Badge variant="secondary">{member.points} pts</Badge>
            </div>
          ))}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
  )
}

export default Member