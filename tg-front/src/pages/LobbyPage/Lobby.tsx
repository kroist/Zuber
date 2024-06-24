import React, { useState } from 'react';
import { User, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LobbyPage = () => {
  const [nickname, setNickname] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const serverUrl = import.meta.env.VITE_BACKEND_URL;
  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };

  const handleConfirm = async () => {
    console.log(nickname);
    if (nickname.trim()) {
      setIsConfirmed(true);
      setIsSearching(true);
      // Here you would typically send the nickname to your backend
      console.log('Nickname confirmed:', nickname);
      await fetch(`${serverUrl}/join_lobby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      });
    }
  };

  const Avatar = () => {
    const avatarUrl = `https://api.dicebear.com/6.x/fun-emoji/svg?seed=${nickname}`;
    return (
      <div className="w-20 h-20 bg-purple-200 rounded-full flex items-center justify-center">
        <img style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '2px solid #fff',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)'
        }} src={avatarUrl} />
        {/* <User size={40} className="text-purple-600" /> */}
      </div>
    )
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-purple-100 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-8 text-purple-800 text-center">Lobby</h1>

        {!isConfirmed ? (
          <div className="space-y-4">
            <Input
              type="text"
              value={nickname}
              onChange={handleNicknameChange}
              placeholder="Enter your nickname"
              className="text-center text-xl h-12"
            />
            <Button
              onClick={handleConfirm}
              disabled={!nickname.trim()}
              className="w-full h-12 text-xl"
            >
              Confirm Nickname
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <Avatar />
            <p className="text-2xl font-semibold text-purple-800">{nickname}</p>
            {isSearching && (
              <Alert variant="default" className="bg-blue-100 border-blue-300">
                <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin text-blue-500" />
                  <AlertDescription className="text-blue-700">
                    Looking for a rider...
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyPage;