'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, MessageSquare, PenTool, Crown, Calendar, Plus, Zap } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Navbar from '@/components/Nav_bar'

// Mock data for the group
const groupData = {
  id: '1',
  name: 'Quantum Physics Explorers',
  description: 'A group dedicated to exploring the fascinating world of quantum physics.',
  owner: {
    id: 'owner1',
    name: 'Dr. Alice Cooper',
    avatar: 'https://i.pravatar.cc/150?u=owner10'
  },
  members: [
    { id: 'member1', name: 'Bob Smith', avatar: 'https://i.pravatar.cc/150?u=member10', points: 120 },
    { id: 'member2', name: 'Charlie Brown', avatar: 'https://i.pravatar.cc/150?u=member20', points: 95 },
    { id: 'member3', name: 'Diana Prince', avatar: 'https://i.pravatar.cc/150?u=member30', points: 150 },
    { id: 'member4', name: 'Ethan Hunt', avatar: 'https://i.pravatar.cc/150?u=member40', points: 80 },
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
}

export default function GroupPage({ params }: { params: { groupId: string } }) {
  const [chatMessage, setChatMessage] = useState('')
  const [messages, setMessages] = useState(groupData.chatMessages)
  const [sessions, setSessions] = useState(groupData.upcomingSessions)

  const sendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: `msg${messages.length + 1}`,
        sender: 'You',
        content: chatMessage,
        timestamp: new Date().toISOString()
      }
      setMessages([...messages, newMessage])
      setChatMessage('')
    }
  }

  const addSession = (title: string, date: string, duration: number) => {
    const newSession = {
      id: `session${sessions.length + 1}`,
      title,
      date,
      duration
    }
    setSessions([...sessions, newSession])
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-10">

      <Navbar />  

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{groupData.name}</CardTitle>
          <CardDescription>{groupData.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={groupData.owner.avatar} alt={groupData.owner.name} />
                <AvatarFallback>{groupData.owner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Group Owner</p>
                <p className="text-sm text-muted-foreground">{groupData.owner.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Group Progress</p>
              <Progress value={groupData.groupProgress} className="w-[200px]" />
              <p className="text-sm text-muted-foreground">{groupData.groupProgress}% Complete</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            Group Chat
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Calendar className="mr-2 h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="whiteboard">
            <PenTool className="mr-2 h-4 w-4" />
            Whiteboard
          </TabsTrigger>
        </TabsList>
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Group Members</CardTitle>
              <CardDescription>Total members: {groupData.members.length + 1}</CardDescription>
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
                      <p className="text-sm text-muted-foreground">Owner</p>
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
                        <p className="text-sm text-muted-foreground">Member</p>
                      </div>
                      <Badge variant="secondary">{member.points} pts</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Group Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] mb-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col">
                      <p className="text-sm font-medium">{message.sender}</p>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-muted-foreground">{new Date(message.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Schedule and manage your study sessions</CardDescription>
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
                    Add New Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Study Session</DialogTitle>
                    <DialogDescription>Set up a new study session for your group.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Title</Label>
                      <Input id="title" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">Date & Time</Label>
                      <Input id="date" type="datetime-local" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="duration" className="text-right">Duration (min)</Label>
                      <Input id="duration" type="number" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={() => {
                      const title = (document.getElementById('title') as HTMLInputElement).value;
                      const date = (document.getElementById('date') as HTMLInputElement).value;
                      const duration = parseInt((document.getElementById('duration') as HTMLInputElement).value);
                      addSession(title, date, duration);
                    }}>Schedule Session</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="whiteboard">
          <Card>
            <CardHeader>
              <CardTitle>Collaborative Whiteboard</CardTitle>
              <CardDescription>Brainstorm and visualize ideas together</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Whiteboard functionality coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Group Achievements</CardTitle>
          <CardDescription>Milestones and rewards for your group's progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Zap className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">5 Consecutive Study Sessions</p>
                <p className="text-sm text-muted-foreground">Unlock special resources</p>
              </div>
              <Badge variant="outline" className="ml-auto">In Progress</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Zap className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm font-medium">100% Attendance for a Month</p>
                <p className="text-sm text-muted-foreground">Group points boost</p>
              </div>
              <Badge variant="outline" className="ml-auto">Completed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

