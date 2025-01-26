import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { acceptRequest, rejectRequest } from '../../lib/group-api'
import { UserAvatar } from '../UserAvatar'
import { toast } from 'sonner'

interface JoinRequestCardProps {
  id: string
  name: string
  avatar: string
  email: string
}

export function JoinRequestCard({ id, name, avatar, email }: JoinRequestCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (action: 'accept' | 'reject') => {
    setIsLoading(true)
    try {
      if (action === 'accept') {
        await acceptRequest(id)
        toast.success('Request accepted', { duration: 3000 })
      } else {
        await rejectRequest(id)
        toast.success('Request rejected', { duration: 3000 })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
            {/* //TODO: Add the avatar image */}
          {/* <img
            src={avatar}
            alt={`${name}'s avatar`}
            width={48}
            height={48}
            className="rounded-full"
          /> */}
          <UserAvatar
            user={{
              name: name || "User",
              avatar: avatar || undefined,
              userId:  email || "default",

            }}
            size={36}
          />
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-sm text-muted-foreground">Wants to join your group</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => handleAction('reject')} 
          disabled={isLoading}
        >
          Reject
        </Button>
        <Button 
          onClick={() => handleAction('accept')} 
          disabled={isLoading}
        >
          Accept
        </Button>
      </CardFooter>
    </Card>
  )
}

