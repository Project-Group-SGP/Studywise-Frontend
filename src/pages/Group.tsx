import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Star } from "lucide-react";
import Navbar from "../components/Nav_bar";
import { useAuth } from "@/components/providers/auth";
import { CreateGroupDialog } from "../components/group/Create-group-dialog";
import { JoinGroupDialog } from "../components/group/join-group-dialog";
import { Group, JoinRequest } from "../type";
import { fetchGroups, getjoinRequest } from "../lib/group-api";
import { GroupSection } from "@/components/group/Group-section";
import { UserGroupSection } from "@/components/group/Users-group-section";

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
      <div className="p-4 text-center">Please log in to view your groups.</div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Welcome Section */}
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
          <p className="text-2xl font-medium mb-2">
            Good {timeOfDay()}, {user?.name || "Scholar"}! 🌟
          </p>
        </div>

        {/* Search and Actions */}
        <div className="max-w-screen-xl mx-auto p-2">
          <div className="flex justify-between items-center gap-4 mb-8">
            <div className="flex gap-4">
              <CreateGroupDialog
                onCreateGroup={(newGroup) =>
                  setCreatedGroups((prevGroups) => [...prevGroups, newGroup])
                }
              />
              <JoinGroupDialog />
            </div>
            <div className="relative w-64">
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
        </div>

        {/* Groups Display */}
        <div className="max-w-screen-xl mx-auto p-2">
          {/* Created Groups Section */}
          <UserGroupSection
            title="Your Created Groups"
            groups={filteredCreatedGroups}
            isLoading={isLoading}
            error={error}
            request={request}
            setRequest={setRequest}
          />
        </div>

        <div className="max-w-screen-xl mx-auto p-2">
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
