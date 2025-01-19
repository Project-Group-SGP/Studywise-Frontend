import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Star, Plus, Users, BookOpen, ArrowRight } from "lucide-react";
import Navbar from "../components/Nav_bar";
import { useAuth } from "@/components/providers/auth";
import { CreateGroupDialog } from "../components/group/Create-group-dialog";
import { JoinGroupDialog } from "../components/group/join-group-dialog";
import { Group, JoinRequest } from "../type";
import { fetchGroups, getjoinRequest } from "../lib/group-api";
import { GroupSection } from "@/components/group/Group-section";
import { UserGroupSection } from "@/components/group/Users-group-section";
import { Card, CardContent } from "@/components/ui/card";

export default function GroupsPage() {
  const { user } = useAuth();
  const [createdGroups, setCreatedGroups] = useState<Group[]>([]);
  const [memberGroups, setMemberGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [request, setRequest] = useState<JoinRequest[]>([]);

  useEffect(() => {
    const loadGroups = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const { createdGroups, memberGroups } = await fetchGroups();
        const requests = await getjoinRequest();
        setCreatedGroups(createdGroups || []);
        setMemberGroups(memberGroups || []);
        setRequest(requests);
      } catch (error) {
        console.error("Error fetching groups:", error);
        setError("Failed to load groups. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadGroups();
  }, [user]);

  const filteredCreatedGroups = createdGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMemberGroups = memberGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const timeOfDay = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000);
    const hour = istTime.getUTCHours();

    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-96 text-center p-6">
          <BookOpen className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-2">Welcome to StudyWise</h2>
          <p className="text-muted-foreground">
            Please log in to view your study groups.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="mb-12 text-center relative">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="inline-flex gap-2">
              <Star className="h-6 w-6 text-yellow-500 animate-pulse" />
              <Star className="h-6 w-6 text-yellow-500 animate-pulse delay-100" />
              <Star className="h-6 w-6 text-yellow-500 animate-pulse delay-200" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Your Study Universe
          </h1>
          <p className="text-2xl font-medium mb-4 flex items-center justify-center gap-2">
            Welcome back, {user?.name || "Scholar"}!
            <span className="text-primary">✨</span>
          </p>
          <p className="text-muted-foreground">
            It's a beautiful {timeOfDay()} for learning together
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Created Groups
                  </p>
                  <p className="text-2xl font-bold">{createdGroups.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-500/5 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined Groups</p>
                  <p className="text-2xl font-bold">{memberGroups.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-pink-500/5 border-pink-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-500/10 rounded-lg">
                  <ArrowRight className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pending Requests
                  </p>
                  <p className="text-2xl font-bold">{request.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="max-w-screen-xl mx-auto p-2">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex gap-4">
              <CreateGroupDialog
                onCreateGroup={(newGroup) =>
                  setCreatedGroups((prevGroups) => [...prevGroups, newGroup])
                }
              />
              <JoinGroupDialog />
            </div>
            <div className="relative w-full md:w-64">
              {/* Search Icon */}
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xl z-10" />

              {/* Input Field */}
              <Input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full bg-background/50 backdrop-blur-sm rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Groups Display */}
        <div className="max-w-screen-xl mx-auto p-2 space-y-8">
          {/* Created Groups Section */}
          <UserGroupSection
            title="Your Created Groups"
            groups={filteredCreatedGroups}
            isLoading={isLoading}
            error={error}
            request={request}
            setRequest={setRequest}
          />

          {/* Member Groups Section */}
          <GroupSection
            title="Groups You're a Member Of"
            groups={filteredMemberGroups}
            isLoading={isLoading}
            error={error}
            isOwner={false}
          />
        </div>
      </div>
    </div>
  );
}
