import { Group } from "../../type";
import { GroupCard } from "./Group-card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { BookOpen, Users } from "lucide-react";

interface GroupSectionProps {
  title: string;
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  isOwner: boolean;
}

export function GroupSection({
  title,
  groups,
  isLoading,
  error,
  isOwner
}: GroupSectionProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="mb-12">
      {/* Enhanced Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          {groups.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary">
              <Users className="h-4 w-4" />
              {groups.length} Group{groups.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div className="mt-2 h-1 w-full bg-gradient-to-r from-primary/20 to-transparent rounded-full" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Skeleton 
              key={index} 
              className="h-[250px] rounded-xl bg-gradient-to-br from-primary/5 to-transparent animate-pulse" 
            />
          ))}
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg bg-red-500/10 border border-red-500/20"
        >
          <p className="text-red-500">{error}</p>
        </motion.div>
      ) : groups.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {groups.map((group) => (
            <motion.div 
              key={group.id}
              variants={itemVariants}
              className="h-full"
            >
              <GroupCard
                group={group}
                isOwner={isOwner}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center p-12 rounded-xl bg-muted/50 border border-border"
        >
          <div className="p-4 bg-primary/5 rounded-full w-fit mx-auto mb-4">
            <Users className="h-12 w-12 text-primary/40" />
          </div>
          <p className="text-lg text-muted-foreground mb-2">
            You haven't joined any study groups yet
          </p>
          <p className="text-sm text-muted-foreground/80">
            Join a group to collaborate with other students and enhance your learning journey
          </p>
        </motion.div>
      )}
    </div>
  );
}