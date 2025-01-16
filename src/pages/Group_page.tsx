import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import {
  Users,
  MessageSquare,
  PenTool,
  Crown,
  Calendar,
  Zap,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Nav_bar";
import Member from "@/components/member";
import Chat from "@/components/Chat";
import Session from "@/components/Session";
import { useNavigate, useParams } from "react-router";
import { deleteGroup, getGroupdetails, leaveGroup } from "@/lib/group-api";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupData } from "@/type";
import { useAuth } from "@/components/providers/auth";

// const groupData1 = {
//   id: "1",
//   name: "Quantum Physics Explorers",
//   description:
//     "A group dedicated to exploring the fascinating world of quantum physics.",
//   owner: {
//     id: "owner1",
//     name: "Dr. Alice Cooper",
//     avatar: "/api/placeholder/150/150",
//   },
//   members: [
//     {
//       id: "member1",
//       name: "Bob Smith",
//       avatar: "/api/placeholder/150/150",
//       points: 120,
//     },
//     {
//       id: "member2",
//       name: "Charlie Brown",
//       avatar: "/api/placeholder/150/150",
//       points: 95,
//     },
//     {
//       id: "member3",
//       name: "Diana Prince",
//       avatar: "/api/placeholder/150/150",
//       points: 150,
//     },
//     {
//       id: "member4",
//       name: "Ethan Hunt",
//       avatar: "/api/placeholder/150/150",
//       points: 80,
//     },
//   ],
//   chatMessages: [
//     {
//       id: "msg1",
//       sender: "Bob Smith",
//       content: "Hey everyone, excited for our next session!",
//       timestamp: "2023-06-10T10:00:00Z",
//     },
//     {
//       id: "msg2",
//       sender: "Dr. Alice Cooper",
//       content: "We'll be covering quantum entanglement.",
//       timestamp: "2023-06-10T10:05:00Z",
//     },
//     {
//       id: "msg3",
//       sender: "Charlie Brown",
//       content: "Can't wait to learn more about it!",
//       timestamp: "2023-06-10T10:10:00Z",
//     },
//   ],
//   upcomingSessions: [
//     {
//       id: "session1",
//       title: "Quantum Entanglement Basics",
//       date: "2023-06-15T14:00:00Z",
//       duration: 90,
//     },
//     {
//       id: "session2",
//       title: "Schrödinger's Cat Paradox",
//       date: "2023-06-20T15:00:00Z",
//       duration: 120,
//     },
//   ],
//   groupProgress: 65,
// };

// Navgar items
const navItems = [
  { id: "members", icon: Users, label: "Study Buddies" },
  { id: "chat", icon: MessageSquare, label: "Group Chat" },
  { id: "sessions", icon: Calendar, label: "Study Time" },
  { id: "whiteboard", icon: PenTool, label: "Brain Space" },
  { id: "achievements", icon: Crown, label: "Your Wins" },
  { id: "resources", icon: BookOpen, label: "Study Hub" },
];

const defaultGroupData: GroupData = {
  id: "",
  name: "",
  subject: "",
  description: undefined, // Optional
  code: "",
  creatorId: "",
  memberIds: [],
  createdAt: new Date().toISOString(),
  creator: {
    id: "",
    name: "",
    email: "",
    avatarUrl: undefined, // Optional
  },
  members: [],
  messages: [],
  sessions: [],
};

export default function StudyGroupPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("members");
  const [groupData, setGroupData] = useState<GroupData>(defaultGroupData);
  const [isLoading, setIsLoading] = useState(true);

  const { groupId } = useParams();

  const { user } = useAuth();

  if(!user) {
    return <div>Loading...</div>;
  }
  
  const { id } = user;

  const navigate = useNavigate();

  const isOwner = groupData.creatorId === id;

  // const isOwner = groupData.creatorId === user?.id;

  // Fetch group data
  useEffect(() => {
    async function fetchGroupData() {
      setIsLoading(true);
      try {
        if (groupId) {
          const data = await getGroupdetails(groupId);
          
          setGroupData(data);
        } else {
          console.error("Group ID is undefined");
        }
      } catch (error) {
        console.error("Error fetching group data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGroupData();
  }, [groupId]);

  return (
    <div className="mt-12 min-h-screen bg-gradient-to-br from-background to-secondary/20 ">
      <Navbar />

      <div
        className={cn(
          "fixed left-0 top-0 h-screen bg-card transition-all duration-300 flex flex-col shadow-lg",
          isCollapsed ? "w-16" : "w-56"
        )}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 bg-primary text-primary-foreground rounded-full p-1 hover:scale-110 transition-transform"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <div className="flex-1 py-20">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center px-4 py-3 transition-all duration-200",
                "hover:bg-primary/10 relative group",
                activeTab === item.id && "bg-primary/15"
              )}
            >
              <div
                className={cn(
                  "flex items-center space-x-3",
                  isCollapsed && "justify-center w-full"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    activeTab === item.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                {!isCollapsed && (
                  <span
                    className={cn(
                      "font-medium text-sm",
                      activeTab === item.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </div>

              {activeTab === item.id && (
                <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full" />
              )}

              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover rounded-md text-sm invisible group-hover:visible whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <div
            className={cn(
              "rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 p-3",
              "transition-all duration-300",
              isCollapsed ? "h-16" : "h-24"
            )}
          >
            <div className="animate-pulse flex items-center justify-center h-full">
              <BookOpen className="h-6 w-6 text-primary opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300 min-h-screen",
          isCollapsed ? "pl-16" : "pl-56"
        )}
      >
        <div className="p-6">
          {/* Header Card */}
          <Card className="mb-8">
            <CardHeader>
              {isLoading ? (
                <Skeleton className="h-8 w-3/4" />
              ) : (
                <CardTitle className="text-3xl font-bold">
                  {groupData?.name}
                </CardTitle>
              )}
              {isLoading ? (
                <Skeleton className="h-4 w-full" />
              ) : (
                <CardDescription>{groupData.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {isLoading ? (
                    <Skeleton className="h-12 w-12 rounded-full" />
                  ) : (
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={groupData?.creator.avatarUrl}
                        alt={groupData?.creator.name}
                      />

                      <AvatarFallback>
                        {groupData?.creator?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <p className="text-sm font-medium">Group Owner</p>
                    {isLoading ? (
                      <Skeleton className="h-4 w-24" />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {groupData?.creator.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Group Progress</p>
                  <div className="w-[200px] h-2 bg-secondary rounded-full mt-2">
                    {isLoading ? (
                      <Skeleton className="h-full w-full rounded-full" />
                    ) : (
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
                        style={{ width: `77%` }}
                      />
                    )}
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-4 w-16 mt-1 ml-auto" />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      {77}% Complete
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      {isOwner ? "Delete Group" : "Leave Group"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{isOwner ? "Delete Group" : "Leave Group"}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {isOwner
                          ? "Are you sure you want to delete this group? This action cannot be undone."
                          : "Are you sure you want to leave this group? You can always join again later."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={async () => {
                        if (isOwner) {

                          await deleteGroup(groupData.id);

                          // Implement delete group logic
                          console.log("Deleting group");
                          // Redirect to /groups
                          navigate("/groups");
                        } else {

                          await leaveGroup(groupData.id);

                          // Implement leave group logic
                          console.log("Leaving group");

                          // Redirect to /groups
                          navigate("/groups");
                        }
                      }}>
                        {isOwner ? "Delete" : "Leave"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Tab Content */}
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          ) : (
            <>
              {activeTab === "members" && <Member 
              groupData={groupData}
              />}
              {activeTab === "chat" && groupId && <Chat groupId={groupId} />}
              {activeTab === "sessions" && <Session />}
              {activeTab === "whiteboard" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Brain Space</CardTitle>
                    <CardDescription>
                      Visualize your ideas together!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Interactive whiteboard coming soon! 🎨
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {activeTab === "achievements" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Study Achievements</CardTitle>
                    <CardDescription>
                      Track your learning milestones!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-4 bg-primary/5 rounded-lg">
                        <Zap className="h-8 w-8 text-yellow-500" />
                        <div className="flex-1">
                          <p className="font-medium">Study Streak Master</p>
                          <p className="text-sm text-muted-foreground">
                            5 consecutive study sessions completed
                          </p>
                          <div className="w-full h-2 bg-secondary rounded-full mt-2">
                            <div
                              className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                              style={{ width: "80%" }}
                            />
                          </div>
                        </div>
                        <Badge variant="secondary">4/5</Badge>
                      </div>

                      <div className="flex items-center space-x-4 p-4 bg-primary/5 rounded-lg">
                        <Crown className="h-8 w-8 text-purple-500" />
                        <div className="flex-1">
                          <p className="font-medium">Knowledge Champion</p>
                          <p className="text-sm text-muted-foreground">
                            Complete 10 group discussions
                          </p>
                          <div className="w-full h-2 bg-secondary rounded-full mt-2">
                            <div
                              className="h-full bg-purple-500 rounded-full transition-all duration-500"
                              style={{ width: "60%" }}
                            />
                          </div>
                        </div>
                        <Badge variant="secondary">6/10</Badge>
                      </div>

                      <div className="flex items-center space-x-4 p-4 bg-primary/5 rounded-lg">
                        <BookOpen className="h-8 w-8 text-green-500" />
                        <div className="flex-1">
                          <p className="font-medium">Study Resource Expert</p>
                          <p className="text-sm text-muted-foreground">
                            Share 5 helpful study resources
                          </p>
                          <div className="w-full h-2 bg-secondary rounded-full mt-2">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all duration-500"
                              style={{ width: "40%" }}
                            />
                          </div>
                        </div>
                        <Badge variant="secondary">2/5</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {activeTab === "resources" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Study Hub</CardTitle>
                    <CardDescription>
                      All your study resources in one place!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg">
                              📚 Study Materials
                            </CardTitle>
                            <CardDescription>
                              Access your course materials and notes
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button variant="outline" className="w-full">
                              Browse Materials
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg">
                              📝 Practice Tests
                            </CardTitle>
                            <CardDescription>
                              Test your knowledge
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button variant="outline" className="w-full">
                              Start Practice
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg">
                              🎯 Study Goals
                            </CardTitle>
                            <CardDescription>
                              Track your learning objectives
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button variant="outline" className="w-full">
                              View Goals
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg">
                              📊 Progress Reports
                            </CardTitle>
                            <CardDescription>
                              Monitor your improvement
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button variant="outline" className="w-full">
                              View Reports
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      <style>{`
        @keyframes glow {
          0% { box-shadow: 0 0 5px var(--primary); }
          50% { box-shadow: 0 0 20px var(--primary); }
          100% { box-shadow: 0 0 5px var(--primary); }
        }

        .active-nav-item {
          animation: glow 2s infinite;
        }
      `}</style>
    </div>
  );
}

// import { useEffect, useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// import { Users, MessageSquare, PenTool, Crown, Calendar, Zap, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

// import { Badge } from "@/components/ui/badge";
// import { cn } from "@/lib/utils";
// import Navbar from '@/components/Nav_bar';
// import Member from '@/components/member';
// import Chat from '@/components/Chat';
// import Session from '@/components/Session';
// import { useParams } from 'react-router';
// import { getGroupdetails } from '@/lib/group-api';

// const groupData1 = {
//   id: '1',
//   name: 'Quantum Physics Explorers',
//   description: 'A group dedicated to exploring the fascinating world of quantum physics.',
//   owner: {
//     id: 'owner1',
//     name: 'Dr. Alice Cooper',
//     avatar: '/api/placeholder/150/150'
//   },
//   members: [
//     { id: 'member1', name: 'Bob Smith', avatar: '/api/placeholder/150/150', points: 120 },
//     { id: 'member2', name: 'Charlie Brown', avatar: '/api/placeholder/150/150', points: 95 },
//     { id: 'member3', name: 'Diana Prince', avatar: '/api/placeholder/150/150', points: 150 },
//     { id: 'member4', name: 'Ethan Hunt', avatar: '/api/placeholder/150/150', points: 80 },
//   ],
//   chatMessages: [
//     { id: 'msg1', sender: 'Bob Smith', content: 'Hey everyone, excited for our next session!', timestamp: '2023-06-10T10:00:00Z' },
//     { id: 'msg2', sender: 'Dr. Alice Cooper', content: 'We\'ll be covering quantum entanglement.', timestamp: '2023-06-10T10:05:00Z' },
//     { id: 'msg3', sender: 'Charlie Brown', content: 'Can\'t wait to learn more about it!', timestamp: '2023-06-10T10:10:00Z' },
//   ],
//   upcomingSessions: [
//     { id: 'session1', title: 'Quantum Entanglement Basics', date: '2023-06-15T14:00:00Z', duration: 90 },
//     { id: 'session2', title: 'Schrödinger\'s Cat Paradox', date: '2023-06-20T15:00:00Z', duration: 120 },
//   ],
//   groupProgress: 65,
// };

// // Navgar items
// const navItems = [
//   { id: 'members', icon: Users, label: 'Study Buddies' },
//   { id: 'chat', icon: MessageSquare, label: 'Group Chat' },
//   { id: 'sessions', icon: Calendar, label: 'Study Time' },
//   { id: 'whiteboard', icon: PenTool, label: 'Brain Space' },
//   { id: 'achievements', icon: Crown, label: 'Your Wins' },
//   { id: 'resources', icon: BookOpen, label: 'Study Hub' }
// ];

// // get group id from the url
// export default function StudyGroupPage (   ) {
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [activeTab, setActiveTab] = useState('members');
//   const [groupData, setGroupData] = useState({});

//   const { groupId } = useParams();

//   console.log("groupId: ", groupId);

//   // Fetch group data
//   useEffect(() => {
//     async function fetchGroupData() {
//       try {
//         if (groupId) {
//           const data = await getGroupdetails(groupId);
//           setGroupData(data);
//           console.log(data);
//           console.log("groupData: ", groupData);

//         } else {
//           console.error('Group ID is undefined');
//         }
//       } catch (error) {
//         console.error('Error fetching group data:', error);
//       }
//     }
//     fetchGroupData();
//   }, [groupId]);

//   return (
//     <div className="mt-12 min-h-screen bg-gradient-to-br from-background to-secondary/20 ">
//       <Navbar />

//       <div className={cn(
//         "fixed left-0 top-0 h-screen bg-card transition-all duration-300 flex flex-col shadow-lg",
//         isCollapsed ? "w-16" : "w-56"
//       )}>
//         <button
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           className="absolute -right-3 top-24 bg-primary text-primary-foreground rounded-full p-1 hover:scale-110 transition-transform"
//         >
//           {isCollapsed ?
//             <ChevronRight className="h-4 w-4" /> :
//             <ChevronLeft className="h-4 w-4" />
//           }
//         </button>

//         <div className="flex-1 py-20">
//           {navItems.map((item) => (
//             <button
//               key={item.id}
//               onClick={() => setActiveTab(item.id)}
//               className={cn(
//                 "w-full flex items-center px-4 py-3 transition-all duration-200",
//                 "hover:bg-primary/10 relative group",
//                 activeTab === item.id && "bg-primary/15"
//               )}
//             >
//               <div className={cn(
//                 "flex items-center space-x-3",
//                 isCollapsed && "justify-center w-full"
//               )}>
//                 <item.icon className={cn(
//                   "h-5 w-5",
//                   activeTab === item.id ? "text-primary" : "text-muted-foreground"
//                 )} />
//                 {!isCollapsed && (
//                   <span className={cn(
//                     "font-medium text-sm",
//                     activeTab === item.id ? "text-primary" : "text-muted-foreground"
//                   )}>
//                     {item.label}
//                   </span>
//                 )}
//               </div>

//               {activeTab === item.id && (
//                 <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full" />
//               )}

//               {isCollapsed && (
//                 <div className="absolute left-full ml-2 px-2 py-1 bg-popover rounded-md text-sm invisible group-hover:visible whitespace-nowrap z-50 shadow-lg">
//                   {item.label}
//                 </div>
//               )}
//             </button>
//           ))}
//         </div>

//         <div className="p-4 border-t border-border">
//           <div className={cn(
//             "rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 p-3",
//             "transition-all duration-300",
//             isCollapsed ? "h-16" : "h-24"
//           )}>
//             <div className="animate-pulse flex items-center justify-center h-full">
//               <BookOpen className="h-6 w-6 text-primary opacity-50" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <main className={cn(
//         "transition-all duration-300 min-h-screen",
//         isCollapsed ? "pl-16" : "pl-56"
//       )}>
//         <div className="p-6">
//           {/* Header Card */}
//           <Card className="mb-8">
//             <CardHeader>
//               <CardTitle className="text-3xl font-bold">{groupData1.name}</CardTitle>
//               <CardDescription>{groupData1.description}</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <Avatar className="h-12 w-12">
//                     <AvatarImage src={groupData1.owner.avatar} alt={groupData1.owner.name} />
//                     <AvatarFallback>{groupData1.owner.name.charAt(0)}</AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <p className="text-sm font-medium">Group Owner</p>
//                     <p className="text-sm text-muted-foreground">{groupData1.owner.name}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm font-medium">Group Progress</p>
//                   <div className="w-[200px] h-2 bg-secondary rounded-full mt-2">
//                     <div
//                       className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
//                       style={{ width: `${groupData1.groupProgress}%` }}
//                     />
//                   </div>
//                   <p className="text-sm text-muted-foreground mt-1">{groupData1.groupProgress}% Complete</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Tab Content */}
//           {activeTab === 'members' && (
//             <Member />
//           )}

//           {activeTab === 'chat' && (
//               <Chat />
//           )}

//           {activeTab === 'sessions' && (
//               <Session />
//           )}

//           {activeTab === 'whiteboard' && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Brain Space</CardTitle>
//                 <CardDescription>Visualize your ideas together!</CardDescription>
//                 </CardHeader>
//               <CardContent>
//                 <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
//                   <p className="text-muted-foreground">Interactive whiteboard coming soon! 🎨</p>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {activeTab === 'achievements' && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Your Study Achievements</CardTitle>
//                 <CardDescription>Track your learning milestones!</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="flex items-center space-x-4 p-4 bg-primary/5 rounded-lg">
//                     <Zap className="h-8 w-8 text-yellow-500" />
//                     <div className="flex-1">
//                       <p className="font-medium">Study Streak Master</p>
//                       <p className="text-sm text-muted-foreground">5 consecutive study sessions completed</p>
//                       <div className="w-full h-2 bg-secondary rounded-full mt-2">
//                         <div className="h-full bg-yellow-500 rounded-full transition-all duration-500" style={{ width: '80%' }} />
//                       </div>
//                     </div>
//                     <Badge variant="secondary">4/5</Badge>
//                   </div>

//                   <div className="flex items-center space-x-4 p-4 bg-primary/5 rounded-lg">
//                     <Crown className="h-8 w-8 text-purple-500" />
//                     <div className="flex-1">
//                       <p className="font-medium">Knowledge Champion</p>
//                       <p className="text-sm text-muted-foreground">Complete 10 group discussions</p>
//                       <div className="w-full h-2 bg-secondary rounded-full mt-2">
//                         <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: '60%' }} />
//                       </div>
//                     </div>
//                     <Badge variant="secondary">6/10</Badge>
//                   </div>

//                   <div className="flex items-center space-x-4 p-4 bg-primary/5 rounded-lg">
//                     <BookOpen className="h-8 w-8 text-green-500" />
//                     <div className="flex-1">
//                       <p className="font-medium">Study Resource Expert</p>
//                       <p className="text-sm text-muted-foreground">Share 5 helpful study resources</p>
//                       <div className="w-full h-2 bg-secondary rounded-full mt-2">
//                         <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: '40%' }} />
//                       </div>
//                     </div>
//                     <Badge variant="secondary">2/5</Badge>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {activeTab === 'resources' && (
//             <Card>
//               <CardHeader>
//                 <CardTitle>Study Hub</CardTitle>
//                 <CardDescription>All your study resources in one place!</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <Card className="hover:shadow-lg transition-shadow">
//                     <CardHeader>
//                       <CardTitle className="text-lg">📚 Study Materials</CardTitle>
//                       <CardDescription>Access your course materials and notes</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <Button variant="outline" className="w-full">Browse Materials</Button>
//                     </CardContent>
//                   </Card>

//                   <Card className="hover:shadow-lg transition-shadow">
//                     <CardHeader>
//                       <CardTitle className="text-lg">📝 Practice Tests</CardTitle>
//                       <CardDescription>Test your knowledge</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <Button variant="outline" className="w-full">Start Practice</Button>
//                     </CardContent>
//                   </Card>

//                   <Card className="hover:shadow-lg transition-shadow">
//                     <CardHeader>
//                       <CardTitle className="text-lg">🎯 Study Goals</CardTitle>
//                       <CardDescription>Track your learning objectives</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <Button variant="outline" className="w-full">View Goals</Button>
//                     </CardContent>
//                   </Card>

//                   <Card className="hover:shadow-lg transition-shadow">
//                     <CardHeader>
//                       <CardTitle className="text-lg">📊 Progress Reports</CardTitle>
//                       <CardDescription>Monitor your improvement</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <Button variant="outline" className="w-full">View Reports</Button>
//                     </CardContent>
//                   </Card>
//                 </div>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </main>

//       <style>{`
//         @keyframes glow {
//           0% { box-shadow: 0 0 5px var(--primary); }
//           50% { box-shadow: 0 0 20px var(--primary); }
//           100% { box-shadow: 0 0 5px var(--primary); }
//         }

//         .active-nav-item {
//           animation: glow 2s infinite;
//         }
//       `}</style>
//     </div>
//   );
// }
