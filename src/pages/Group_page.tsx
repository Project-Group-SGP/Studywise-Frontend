import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "react-router";
import { getGroupdetails, leaveGroup, deleteGroup } from "@/lib/group-api";
import { cn } from "@/lib/utils";
import {
  Users,
  MessageSquare,
  PenTool,
  Crown,
  Calendar,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Member from "@/components/member";
import Chat from "@/components/Chat";
import Session from "@/components/Session";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import Navbar from "@/components/Nav_bar";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { id: "members", icon: Users, label: "Study Buddies" },
  { id: "chat", icon: MessageSquare, label: "Group Chat" },
  { id: "sessions", icon: Calendar, label: "Study Time" },
  { id: "whiteboard", icon: PenTool, label: "Brain Space" },
  { id: "achievements", icon: Crown, label: "Your Wins" },
];

const defaultGroupData: {
  id: string;
  name: string;
  subject: string;
  description?: string;
  code: string;
  creatorId: string;
  memberIds: string[];
  createdAt: string;
  creator: { id: string; name: string; email: string; avatarUrl?: string };
  members: any[];
  messages: any[];
  sessions: any[];
} = {
  id: "",
  name: "",
  subject: "",
  description: undefined,
  code: "",
  creatorId: "",
  memberIds: [],
  createdAt: new Date().toISOString(),
  creator: { id: "", name: "", email: "", avatarUrl: undefined },
  members: [],
  messages: [],
  sessions: [],
};

export default function StudyGroupPage() {
  const [activeTab, setActiveTab] = useState("members");
  const [groupData, setGroupData] = useState(defaultGroupData);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const { groupId } = useParams();
  const { user } = useAuth();
  const id = user?.id;
  const navigate = useNavigate();
  const isOwner = groupData.creatorId === id;

  useEffect(() => {
    async function fetchGroupData() {
      setIsLoading(true);
      try {
        if (groupId) {
          const data = await getGroupdetails(groupId);
          setGroupData(data);
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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-20">
        <Card
          className="mb-8 overflow-hidden relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10"
            animate={{
              backgroundPosition: isHovered
                ? ["0% 50%", "100% 50%"]
                : ["100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              ease: "linear",
              repeat: Number.POSITIVE_INFINITY,
            }}
          />

          <CardHeader className="relative space-y-4">
            {isLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {groupData.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Users className="h-4 w-4" />
                    {groupData.members?.length || 0}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Calendar className="h-4 w-4" />
                    {new Date(groupData.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            )}

            {isLoading ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <CardDescription className="text-base">
                {groupData.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="relative space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                {isLoading ? (
                  <Skeleton className="h-12 w-12 rounded-full" />
                ) : (
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Avatar className="h-12 w-12 ring-2 ring-primary ring-offset-2 transition-all duration-200 group-hover:ring-secondary">
                      <AvatarImage
                        src={groupData.creator.avatarUrl}
                        alt={groupData.creator.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                        {groupData.creator.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Sparkles className="h-5 w-5 text-[hsl(var(--chart-4))] absolute -top-1 -right-1" />
                  </motion.div>
                )}
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    Group Owner
                    <ArrowRight className="h-4 w-4" />
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <p className="text-sm text-muted-foreground font-medium">
                      {groupData.creator.name}
                    </p>
                  )}
                </div>
              </div>

              <motion.div
                className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-secondary/20 p-2 rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="h-6 w-6 text-[hsl(var(--chart-1))]" />
                <span className="font-semibold text-sm text-primary-foreground">
                  Group Power
                </span>
              </motion.div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isOwner ? "Delete Group" : "Leave Group"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {isOwner ? "Delete Group" : "Leave Group"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {isOwner
                        ? "Are you sure you want to delete this group? This action cannot be undone."
                        : "Are you sure you want to leave this group? You'll need to be invited back to rejoin."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        if (isOwner) {
                          await deleteGroup(groupData.id);
                          navigate("/groups");
                        } else {
                          await leaveGroup(groupData.id);
                          navigate("/groups");
                        }
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isOwner ? "Delete" : "Leave"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  View Sessions
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Start Study Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <>
            {activeTab === "members" && <Member groupData={groupData} />}
            {activeTab === "chat" && groupId && <Chat groupId={groupId} />}
            {activeTab === "sessions" && <Session />}
            {activeTab === "whiteboard" && <div>Whiteboard</div>}
          </>
        )}
      </main>

      {/* Floating Bottom Navbar */}
      <nav
        aria-label="Main Navigation"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4",
          "dark:bg-transparent"
        )}
      >
        <div
          className={cn(
            "bg-white border border-border/50 rounded-xl shadow-lg px-2 py-1",
            "flex items-center space-x-2",
            "dark:bg-gray-800 dark:border-gray-700/50 dark:shadow-2xl"
          )}
        >
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
interface NavItemProps {
  item: {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  };
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ item, isActive, onClick }: NavItemProps) => {
  return (
    <button
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center",
        "w-16 p-2 rounded-lg transition-all duration-300",
        isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-primary/5 text-muted-foreground",
        "dark:text-gray-300 dark:hover:bg-primary/10 dark:active:bg-primary/20"
      )}
    >
      {/* Tooltip */}
      <div
        className={cn(
          "absolute top-[-40px] bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          "dark:bg-white dark:text-black"
        )}
        role="tooltip"
      >
        {item.label}
      </div>

      {/* Icon */}
      <div
        className={cn(
          "p-2 rounded-full transition-all",
          isActive ? "bg-primary/20 scale-110" : "group-hover:bg-primary/10",
          "dark:group-hover:bg-primary/20"
        )}
      >
        <item.icon
          className={cn(
            "h-5 w-5",
            isActive
              ? "text-primary"
              : "text-muted-foreground dark:text-gray-400"
          )}
        />
      </div>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          layoutId="nav-active-dot"
          className={cn(
            "h-1 w-1 bg-primary rounded-full mt-1",
            "dark:bg-primary"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </button>
  );
};
