import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowRight, Smartphone, Loader } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import QRCode from 'react-qr-code';
import zuber from '@/components/svg/zuber.svg';
import { useNavigate } from 'react-router-dom';


const QRCodeGen = ({ url }) => {
  // This is a placeholder for a QR code component
  // In a real application, you'd use a library like qrcode.react
  return (
    <div className="bg-white p-4 rounded-lg">
      <div className="w-64 h-64 bg-gray-300 flex items-center justify-center">
        {/* QR Code for: {url} */}
        <QRCode value = {url}/>
      </div>
    </div>
  );
};

const LobbyCodePage = () => {
  const [lobbyCode, setLobbyCode] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const navigate = useNavigate();
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
      // Here you would typically send the nickname to your backend
      try {
        const response = await fetch(`${serverUrl}/join_lobby`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nickname, lobby_id: lobbyCode }),
        });
        if (!response.ok) {
          setShowSuccess(true);
        } else {
          setIsConfirmed(true);
          setIsSearching(true);
          console.log('Nickname confirmed:', nickname);
        }
      } catch (err) {
        setShowSuccess(true);
      }
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


  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 2000); // Consider devices with width >= 1024px as desktop
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    setIsValid(lobbyCode.length === 6 && /^\d+$/.test(lobbyCode));
  }, [lobbyCode]);

  const handleInputChange = (e) => {
    const value = e.target.value.slice(0, 6);
    setLobbyCode(value);
    setShowSuccess(false);
  };

  console.log(import.meta.env);

  const mobileUrl: string = import.meta.env.VITE_MOBILE_URL; // Replace with your actual mobile URL

  if (isDesktop) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-purple-100 p-4">
        <div className="absolute top-4 left-4">
          <img src={zuber} width='100%' />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">Enter App on Mobile</h1>
          <p className="text-xl text-purple-600">Scan this QR code with your mobile device to use the app</p>
        </div>
        <QRCodeGen url={mobileUrl} />
        <div className="mt-4 p-3 bg-white rounded-lg shadow-md">
          <p className="text-blue-600 font-mono text-lg break-all">{mobileUrl}</p>
        </div>
        <Alert variant="default" className="mt-8 max-w-md">
          <Smartphone className="h-4 w-4" />
          <AlertTitle>Desktop Detected</AlertTitle>
          <AlertDescription>
            This app is optimized for mobile devices. Please use your smartphone to join.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center min-h-screen bg-purple-100 p-4">
      <img src={zuber} width='70%' className='pb-20' />
      {!isConfirmed ?
      (<div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 text-purple-800">Join Lobby</h1>
        <div className="w-full max-w-xs">
          <Input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={6}
            value={lobbyCode}
            onChange={handleInputChange}
            placeholder="Enter 6-digit code"
            className="text-center text-2xl mb-4 h-16"
          />
          <Input
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="Enter your nickname"
            className="text-center text-xl mb-4 h-12"
          />
          <Button 
            onClick={handleConfirm}
            disabled={!isValid || !nickname.trim()} 
            className="w-full h-16 text-xl"
          >
            Join <ArrowRight className="ml-2" />
          </Button>
        </div>
        {!isValid && lobbyCode.length > 0 && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Please enter a valid 6-digit code.
            </AlertDescription>
          </Alert>
        )}
        {showSuccess && (
          <Alert variant="default" className="mt-4 bg-red-100 border-red-500">
            <AlertTitle className="text-red-800">Bad lobby!</AlertTitle>
            <AlertDescription className="text-red-700">
              Could not find lobby with code: {lobbyCode}
            </AlertDescription>
          </Alert>
        )}
      </div>) :
      (
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
      )
      }
    </div>
  );
};

export default LobbyCodePage;
