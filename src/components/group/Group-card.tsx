import { useState } from "react";
import { Group, JoinRequest } from "../../type";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Calendar, Check, Copy, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { acceptRequest, rejectRequest } from "@/lib/group-api";
import { useNavigate } from "react-router";

interface GroupCardProps {
  group: Group;
  isOwner: boolean;
  isRequest?: number;
  requests?: JoinRequest[];
  setRequest?: React.Dispatch<React.SetStateAction<JoinRequest[]>>;
}

export function GroupCard({ group, isOwner, isRequest = 0, requests = [], setRequest }: GroupCardProps) {
  const [openCodeDialog, setOpenCodeDialog] = useState(false);
  const [openRequestsDialog, setOpenRequestsDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  console.log("GroupCard");
  
  console.log(requests.at(0)?.id);
  

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.code);
    setCopied(true);
    toast({title: "Code copied to clipboard", type:"foreground" });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleAcceptRequest = async (requestId: string) => {
    // Update the state to remove the accepted request
    console.log("requestId: ", requestId);
    
    setRequest?.(prevRequests => prevRequests.filter(req => req.id !== requestId));

    try{
        const respose = await acceptRequest(requestId);
        console.log("response: ", respose);
        
      toast({title: "Request accepted", type:"foreground" });
    } catch (error) {
      console.error("Error accepting request:", error);
      toast({title: "Error accepting request", type:"foreground" });
    }
  };

  const handleRejectRequest = async(requestId: string) => {
    // Update the state to remove the rejected request
    setRequest?.(prevRequests => prevRequests.filter(req => req.id !== requestId));

    try{
      const response = await rejectRequest(requestId);
      console.log("response: ", response);
      toast({title: "Request rejected", type:"foreground" });
    }catch{
      toast({title: "Error rejecting request", type:"foreground" });
    } 

  };

  const RequestItem = ({ request }: { request: JoinRequest }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={request.avatar} alt={request.name} />
          <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{request.name}</p>
          <p className="text-sm text-muted-foreground">{request.email}</p>
        </div>
      </div>
      <div className="space-x-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleAcceptRequest(request.id)}
        >
          Accept
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleRejectRequest(request.id)}
        >
          Reject
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{group.name}</CardTitle>
            <CardDescription className="text-white/90">
              {group.subject}
            </CardDescription>
          </div>
          {isOwner && (
            <Dialog open={openCodeDialog} onOpenChange={setOpenCodeDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-white hover:text-white/80"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="min-w-10 max-w-60">
                <DialogHeader>
                  <DialogTitle>Group Code</DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                  <code>{group.code}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCopyCode}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Users size={16} />
            <span>{group.memberIds.length} members</span>
          </div>
          <Badge variant="secondary">{group.subject}</Badge>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
          <Calendar size={16} />
          <span>Next meeting: {group.nextMeeting}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" className="flex-1 hover:bg-primary/5"
         onClick={() => navigate(`/groups/${group.id}`)}
        >
          <BookOpen className="mr-2 h-4 w-4" /> View Group
        </Button>
        {isRequest > 0 && (
          <Dialog open={openRequestsDialog} onOpenChange={setOpenRequestsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="ml-2 hover:bg-primary/5">
                <UserPlus className="mr-2 h-4 w-4" />
                {isRequest} Request{isRequest > 1 ? 's' : ''}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Group Join Requests</DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto">
                {requests.map((request) => (
                  <RequestItem key={request.id} request={request} />
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}

