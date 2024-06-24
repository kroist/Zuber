import React, { useState, useEffect } from 'react';
import { AlertCircle, Users, Loader } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Button } from './components/ui/button';
import logo from './logo.svg';
import { ScrollArea } from './components/ui/scroll-area';

interface OpenLobbyProps {
  lobbyCreated: boolean;
  users: {
    id: number,
    nickname: string,
    position: number[],
  }[];
  setLobbyCreated: (lobbyCreated: boolean) => void;
  lookingForDriver: boolean;
  setLookingForDriver: (lookingForDriver: boolean) => void;
}

const OpenLobby = (props: OpenLobbyProps) => {
  const [lobbyCode, setLobbyCode] = useState('');

  const serverUrl = process.env.REACT_APP_SERVER_URL;

  // Fetch lobby code from server
  const createLobby = async () => {
    const response = await fetch(`${serverUrl}/create_lobby`, {
      method: 'POST'
    });
    const data = await response.json();
    setLobbyCode(data.lobby_id);
    props.setLobbyCreated(true);
  }

  const getAvatarUrl = (name: string) => {
    return `https://api.dicebear.com/6.x/fun-emoji/svg?seed=${name}`;
  };

  const findDriver = () => {
    props.setLookingForDriver(true);
  }

  return (
    <div className="flex flex-col max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <img src={logo} width='70%' className='pb-20 self-center' />
      {
        !props.lobbyCreated ? (
          <Button
            onClick={createLobby}
            className="bg-purple-500 hover:bg-purple-400 w-full h-12 text-xl"
          >
            Create Lobby
          </Button>

        ) : (
          <div>
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lobby Code</AlertTitle>
              <AlertDescription className="text-3xl font-bold">{lobbyCode}</AlertDescription>
            </Alert>

            <ScrollArea className='h-96 rounded-md border p-4'>
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Users className="mr-2" /> Players ({props.users.length})
                </h2>
                <div className="grid grid-cols-4 gap-4">
                  {props.users.map((player, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <img 
                        src={getAvatarUrl(player.nickname)} 
                        alt={`${player.nickname}'s avatar`} 
                        className="w-16 h-16 rounded-full mb-2"
                      />
                      <span className="text-sm text-center">{player.nickname}</span>
                    </div>
                  ))}
                </div>
                {props.users.length === 0 && (
                  <p className="text-gray-500 italic text-center">Waiting for players to join...</p>
                )}
              </div>
            </ScrollArea>
            { !props.lookingForDriver ?
            (
              <Button
                onClick={findDriver}
                className="bg-purple-500 hover:bg-purple-400 w-full h-12 text-xl mt-6"
              >
                Find driver
              </Button>
            ) :
            (
              <Button
                onClick={findDriver}
                className="bg-purple-500 hover:bg-purple-400 w-full h-12 text-xl mt-6"
              >
                Click on the map
                <Loader className="ml-4 h-4 w-4 animate-spin text-white-500" />
              </Button>
            )
            }
          </div>
        )
      }

    </div>
  );
};

export default OpenLobby;

/*
---public---
y[]
j
pubkey
---private---
x[]
len[]
sig[]

msg[i] = [x, y[i], len[i]]
pubkey
sig[i]

verify(pubkey, sig, msg) == true
len[j] <= len[i]

*/