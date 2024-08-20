// sarvesh singh
import CollaborativeRoom from "@/components/CollaborativeRoom";
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
// sarvesh singh
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Document = async ({ params: { id } }: { params: { id: string } }) => {
  
  try {
    const clerkUser = await currentUser();

    if (!clerkUser || !clerkUser.emailAddresses || clerkUser.emailAddresses.length === 0) {
      redirect('/sign-in');
      return; 
    }

    const userEmail = clerkUser.emailAddresses[0].emailAddress;
    if (!userEmail) {
      redirect('/sign-in');
      return; 
    }

  
    const room = await getDocument({
      roomId: id,
      userId: userEmail,
    });

    if (!room) {
      redirect('/');
      return; 
    }

    const userIds = Object.keys(room.usersAccesses);
    const users = await getClerkUsers({ userIds });

   
    const usersData = users.map((user: any) => ({
      ...user,
      userType: room.usersAccesses[user.email]?.includes('room:write')
        ? 'editor'
        : 'viewer'
    }));

    
    const currentUserType = room.usersAccesses[userEmail]?.includes('room:write') ? 'editor' : 'viewer';
// sarvesh singh
    return (
      <main className="flex w-full flex-col items-center">
        <CollaborativeRoom 
          roomId={id}
          roomMetadata={room.metadata}
          users={usersData}
          currentUserType={currentUserType}
        />
      </main>
    );
  } catch (error) {
    console.error('Error fetching document or user data:', error);
    redirect('/');
  }
};

export default Document;















// sarvesh singh














// sarvesh singh