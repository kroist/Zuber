// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Button } from './components//ui/button';
import { Input } from './components//ui/input';
import { Toast } from './components//ui/toast';
import { AlertCircle } from 'lucide-react';
import L from 'leaflet';
import { Buffer } from "buffer";
import * as snarkjs from 'snarkjs';
import { buildEddsa } from 'circomlibjs';


// @ts-ignore
import { MaptilerLayer } from "@maptiler/leaflet-maptilersdk";
import RoutingMachine from './RoutingMachine';
import OpenLobby from './OpenLobby';

// Custom icon for user markers
const userIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

class User {
    id: number;
    nickname: string;
    position: number[];
    
    constructor(id: number, nickname: string, position: [number, number]) {
        this.id = id;
        this.nickname = nickname;
        this.position = position;
    }
}

const KrakowMapComponent = () => {
  const krakowPosition = [50.0647, 19.9450];
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<User>({ id: 1, nickname: '', position: [0, 0] });
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [lobbyCreated, setLobbyCreated] = useState(false);
  const [lookingForDriver, setLookingForDriver] = useState(false);
  const wsUrl = process.env.REACT_APP_SERVER_WS_URL!;
  const serverUrl = process.env.REACT_APP_SERVER_URL!;

  const mtLayer = new MaptilerLayer({
    // Get your free API key at https://cloud.maptiler.com
    apiKey: "wAy7syZy5B3ZPkd1Vg3U",
  });

  const positions = [
    [50.0647, 19.9750],
    [50.0600, 19.9400],
    [50.0700, 19.9500],
    [50.0300, 19.9500],
    [50.0645, 19.9069],
    [50.0747, 19.9319],
    [50.0260, 19.9294],
    [50.0436, 19.9936],
    [50.0623, 19.9846],
    [50.0463, 19.9249],
  ];

  const osrmUrl = 
    '19.965763092041016,50.05526515901147;19.975,50.0647?overview=false&alternatives=true&steps=true&hints=;';

  useEffect(() => {
    if (newUser.position[0] === 0) {
      return;
    }
    async function prove() {
      let lengths = [];
      for (let i = 0; i < users.length; i++) {
        try {
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${newUser.position[1]},${newUser.position[0]};${users[i].position[1]},${users[i].position[0]}?overview=false&alternatives=true&steps=true&hints=;`,          
          );
          const data = await response.json();
          lengths.push(Math.floor(data.routes[0].distance));
          console.log(lengths[i]);
        } catch (err) {
          console.log(err);
        }
      };
      if (lengths.length >= users.length && users.length > 0) {
        console.log('lool');


        let msgPriv = [];
        let msgPub;
        let msg = [];
        {
          const arr4 = newUser.position[0].toFixed(4).toString().split(".");
          const hex4 = parseInt(arr4[0]+arr4[1].slice(3)).toString(16);
          const arr5 = newUser.position[1].toFixed(4).toString().split(".");
          const hex5 = parseInt(arr5[0]+arr5[1].slice(3)).toString(16);
          msgPub = Buffer.from(hex4 + hex5, "hex");
          console.log('lol', buffer2bits(msgPub).length);
        }

        for (let i = 0; i < users.length; i++) {
          const arr1 = positions[i][0].toFixed(4).toString().split(".");
          const hex1 = parseInt(arr1[0]+arr1[1].slice(3)).toString(16);
          const arr2 = positions[i][1].toFixed(4).toString().split(".");
          const hex2 = parseInt(arr2[0]+arr2[1].slice(3)).toString(16);
          const arr3 = lengths[i].toString();
          const hex3 = parseInt(arr3).toString(16);
          
          msgPriv.push(Buffer.from(hex1 + hex2 + hex3, "hex"));
          msg.push(Buffer.concat([msgPriv[i], msgPub]));
        }
        while (msg.length < 5) {
          msgPriv.push(msgPriv[0]);
          msg.push(msg[0]);
        }
        console.log(msgPriv, msgPub, msg);

        const prvKey = Buffer.from("0001020304050607080900010203040506070809000102030405060708090001", "hex");
        
        const eddsa = await buildEddsa();

        const pubKey = eddsa.prv2pub(prvKey);

        const msgPubBits = buffer2bits(msgPub);
        const msgPrivBits = msgPriv.map((curmsg) => buffer2bits( curmsg));
        const { proof } = await snarkjs.groth16.fullProve(
          {
            msgPub: msgPubBits,
            msgPriv: msgPrivBits
          },
          "circuit.wasm",
          "circuit_0000.zkey",
        );
        // await proveOnServer();
        // console.log(proof);
    
      }
    };
    prove();
  }, [newUser]);

  function buffer2bits(buff: any) {
    const res = [];
    for (let i=0; i<buff.length; i++) {
        for (let j=0; j<8; j++) {
            if ((buff[i]>>j)&1) {
                res.push(BigInt(1));
            } else {
                res.push(BigInt(0));
            }
        }
    }
    return res;
  }


  useEffect(() => {
    if (lobbyCreated) {

      console.log(wsUrl);
      const socket = new WebSocket(wsUrl);

      // Handle the open event
      socket.onopen = () => {
        console.log('WebSocket connection opened');
      };

      // Handle messages received from the server
      socket.onmessage = (event) => {
        try {
          console.log('Message received:', event.data);
          const data = JSON.parse(event.data);
          if (data.type === 'lobby_joined') {
            let newUsers = [];
            for (let i = 0; i < data.users.length; i++) {
              newUsers.push(new User(i, data.users[i], [positions[i][0], positions[i][1]]));
            }
            setUsers(newUsers);
          }
        } catch (err) {

        }
      };

      // Handle the close event
      socket.onclose = () => {
        console.log('WebSocket connection closed');
      };
      setWs(socket);

      fetch(`${serverUrl}/lobby_users`, {
        method: 'GET',
      })
      .then(response => response.json())
      .then(data => {
        let newUsers = [];
        for (let i = 0; i < data.users.length; i++) {
          try {
            newUsers.push(new User(i, data.users[i], [positions[i][0], positions[i][1]]));
          } catch (e) {

          }
        }
        setUsers(newUsers);
      });
    }
  }, [lobbyCreated]);

  const createCustomIcon = (user: User) => {
    const avatarUrl = `https://api.dicebear.com/6.x/fun-emoji/svg?seed=${user.nickname}`;
    
    return L.divIcon({
      className: 'custom-icon',
      html: `
        <div class="avatar-container">
          <img src="${avatarUrl}" alt="${user.nickname}" class="avatar" />
          <div class="email-popup">${user.nickname}</div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  };

  // Custom component to handle map events
  const MapEvents = () => {
    const map = useMap();
    useEffect(() => {
      map.on('click', (e) => {
        if (lookingForDriver) {
          if (e.latlng.lat.toFixed(4) === '0' || e.latlng.lng.toFixed(4) === '0') {
            return;
          }
          console.log([e.latlng.lat.toFixed(4), e.latlng.lng.toFixed(4)]);
          setNewUser({ ...newUser, position: [e.latlng.lat, e.latlng.lng] });
          console.log(newUser.position);
        }
      });
    }, [map]);
    return null;
  };

  return (
    <div className="h-screen w-full flex flex-row">
      
      <OpenLobby 
        lobbyCreated={lobbyCreated}
        setLobbyCreated={setLobbyCreated}
        users={users}
        lookingForDriver={lookingForDriver}
        setLookingForDriver={setLookingForDriver}
      />
      <div className="flex-grow">
        <MapContainer 
          center={[krakowPosition[0], krakowPosition[1]]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          layers={[mtLayer]}
        >
          {/* <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          /> */}
          {users.map((user) => (
            <Marker 
                key={user.id} 
                position={[user.position[0], user.position[1]]} 
                icon={createCustomIcon(user)}
            >
            </Marker>
          ))}
          {newUser.position[0] !== 0 && (
            <Marker 
              position={[newUser.position[0], newUser.position[1]]} 
              icon={createCustomIcon({id: 1, nickname: 'Passenger', position: [1, 1]})} 
            >

            </Marker>
          )}
          {users.map((user) => {
            if (newUser.position[0] === 0)
              return null;
            console.log('here');
            return <RoutingMachine 
              key={user.id}
              points={[
                [newUser.position[0], newUser.position[1]], 
                [users[user.id].position[0], users[user.id].position[1]]
              ]}
              id={user.id}
            />
          })}
          <MapEvents />
        </MapContainer>
      </div>

    </div>
  );
};

export default KrakowMapComponent;