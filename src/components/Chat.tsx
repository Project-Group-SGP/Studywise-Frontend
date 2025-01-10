import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";

const groupData = {
  id: "1",
  name: "Quantum Physics Explorers",
  description:
    "A group dedicated to exploring the fascinating world of quantum physics.",
  owner: {
    id: "owner1",
    name: "Dr. Alice Cooper",
    avatar: "/api/placeholder/150/150",
  },
  members: [
    {
      id: "member1",
      name: "Bob Smith",
      avatar: "/api/placeholder/150/150",
      points: 120,
    },
    {
      id: "member2",
      name: "Charlie Brown",
      avatar: "/api/placeholder/150/150",
      points: 95,
    },
    {
      id: "member3",
      name: "Diana Prince",
      avatar: "/api/placeholder/150/150",
      points: 150,
    },
    {
      id: "member4",
      name: "Ethan Hunt",
      avatar: "/api/placeholder/150/150",
      points: 80,
    },
  ],
  chatMessages: [
    {
      id: "msg1",
      sender: "Bob Smith",
      content: "Hey everyone, excited for our next session!",
      timestamp: "2023-06-10T10:00:00Z",
    },
    {
      id: "msg2",
      sender: "Dr. Alice Cooper",
      content: "We'll be covering quantum entanglement.",
      timestamp: "2023-06-10T10:05:00Z",
    },
    {
      id: "msg3",
      sender: "Charlie Brown",
      content: "Can't wait to learn more about it!",
      timestamp: "2023-06-10T10:10:00Z",
    },
  ],
  upcomingSessions: [
    {
      id: "session1",
      title: "Quantum Entanglement Basics",
      date: "2023-06-15T14:00:00Z",
      duration: 90,
    },
    {
      id: "session2",
      title: "Schrödinger's Cat Paradox",
      date: "2023-06-20T15:00:00Z",
      duration: 120,
    },
  ],
  groupProgress: 65,
};

const Chat = () => {
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState(groupData.chatMessages);
  const sendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: `msg${messages.length + 1}`,
        sender: "You",
        content: chatMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages([...messages, newMessage]);
      setChatMessage("");
    }
  };

  return (
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
                <p className="text-xs text-muted-foreground">
                  {new Date(message.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex space-x-2">
          <Input
            placeholder="Type your message..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chat;
