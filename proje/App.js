import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert , ImageBackground} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from '@firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from '@firebase/auth';
import Game from './src/Game';
import Game2 from './src/Game2';
import Select from './src/Select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client'

const firebaseConfig = {
  apiKey: "AIzaSyAWphFuoFDtjJY9roimwlEIacY3HPUb3tI",
  authDomain: "yazlab-289d3.firebaseapp.com",
  projectId: "yazlab-289d3",
  storageBucket: "yazlab-289d3.appspot.com",
  messagingSenderId: "951152425050",
  appId: "1:951152425050:web:bd284b9228e9ea81820063",
  measurementId: "G-4WB7SYQ29H"
};

const app = initializeApp(firebaseConfig);

const Stack = createNativeStackNavigator();

const socket = io('http://localhost:3000');


const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const auth = getAuth(app);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        //  navigation.navigate('Game');
        socket.emit('userLogin', { email: user.email });
      }
    });

    return () => unsubscribe();
  }, [auth, navigation]);


  useEffect(() => {
    socket.on('usersUpdate', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('usersUpdate');
    };
  }, []);

  

  const handleAuthentication = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Error', 'Please fill in all fields!');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long!');
        return;
      }

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in successfully!');
        navigation.navigate('Waiting', { email: email });
        setEmail(''); // Email ve şifre alanlarını temizle
        setPassword('');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Registration Successful!');
        console.log('User created successfully!');
        setIsLogin(true); // Kayıt işlemi tamamlandığında isLogin'i true yap
        setEmail(''); // Email ve şifre alanlarını temizle
        setPassword('');
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
      if (error.code === 'auth/invalid-credential') {
        Alert.alert('Error', 'Invalid email or password!');
      }
    }
  };

  return (
    <ImageBackground source={require('./assets/2.png')} style={styles.authContainer} resizeMode="stretch">
      <View style={styles.content}>
        <Text style={styles.title}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
        <View style={styles.buttonContainer}>
          <Button title={isLogin ? 'Sign In' : 'Sign Up'} onPress={handleAuthentication} color="#3498db" />
        </View>
        <View style={styles.bottomContainer}>
          <Text style={styles.toggleText} onPress={() => { setIsLogin(!isLogin); setEmail(''); setPassword(''); }}>
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};



const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Game" component={Game} />
        <Stack.Screen name="Waiting" component={WaitingRoom} />
        <Stack.Screen name="Select" component={Select} />
        <Stack.Screen name="Game2" component={Game2} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Socket.io işlemleri burada olsun, sunucu ile iletişim sağlansın
socket.on('connect', () => {
  console.log('Connected to server');
});

// WaitingRoom bileşeninde handleFindMatch fonksiyonunu güncelleyerek Game.js'e yönlendirme işlemini gerçekleştirebiliriz
const WaitingRoom = ({ navigation }) => {
  const { email } = navigation?.state?.params ?? {};
  const username = email?.split('@')[0] ;
  const [roomNumber, setRoomNumber] = useState('');
  const [matchFound, setMatchFound] = useState(false);
  const [waiting, setWaiting] = useState(false);
  

  useEffect(() => {
    socket.on('matchFound', ({ roomNumber }) => {
      setMatchFound(true);
      setRoomNumber(roomNumber);
    });

    socket.on('userJoined', () => {
      setMatchFound(true);
    });

    return () => {
      socket.off('matchFound');
      socket.off('userJoined');
    };
  }, []);

  const handleFindMatch = async () => {
    if (!roomNumber) {
      Alert.alert('Error', 'Please enter a room number!');
      return;
    }
  
    socket.emit('createRoom', { roomNumber });
  
    // Game.js'e yönlendirme işlemi burada gerçekleşecek
    navigation.navigate('Select', { roomNumber });
  
    socket.once('matchFound', ({ roomNumber }) => {
      setMatchFound(true);
      setRoomNumber(roomNumber);
    });
  
    socket.once('waiting', () => {
      setWaiting(true);
      setMatchFound(false);
    });
  };
  
  
  

  useEffect(() => {
    if (matchFound) {
      navigation.navigate('Game', { roomNumber });
    }
  }, [matchFound, roomNumber]);
  return (
    <ImageBackground source={require('./assets/2.png')} style={styles.authContainer} resizeMode="stretch">

    <View style={styles.container}>
      <Text style={styles.Welcome}>Welcome {username}</Text>
      {!matchFound ? (
        <View>
          <TextInput
            style={styles.input}
            value={roomNumber}
            onChangeText={setRoomNumber}
            placeholder="Enter Room Number"
            keyboardType="numeric"
          />
          <View style={styles.buttonContainer}>
            <Button title="Find Match" onPress={handleFindMatch} color="#3498db" />
          </View>
        </View>
      ) : (
        <View>
          {!waiting ? (
            <Text style={styles.Welcome}>Waiting for another player...</Text>
          ) : (
            <Text style={styles.Welcome}>Match Found! Room Number: {roomNumber}</Text>
          )}
        </View>
      )}
    </View>
    </ImageBackground>
  );
};




const styles = StyleSheet.create({
  Welcome:{
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center', // Metni yatay düzlemde ortalamak için
    marginTop: 10,
    marginBottom:20,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
    width: 200,
    backgroundColor: 'white',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  toggleText: {
    color: '#3498db',
    textAlign: 'center',
  },
  bottomContainer: {
    marginTop: 20,
  },
  container: {
    //flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding:30,
    borderRadius:10,
  },
  content: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
  }
});

export default App;
