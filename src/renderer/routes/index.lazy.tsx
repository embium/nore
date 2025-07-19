import { createLazyFileRoute } from '@tanstack/react-router';
import { Middlebar } from '../components/Middlebar';
import { Outlet } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <>
      <Middlebar
        headerTitle="Chats"
        header={<div>Chats</div>}
      >
        <div>Chats</div>
      </Middlebar>
      <div className="h-full w-full flex flex-col">
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="max-w-md space-y-4">
            <h3 className="text-xl font-semibold">No messages yet</h3>
            <p className="text-muted-foreground">
              Start a conversation by typing a message below.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
