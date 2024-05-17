import React, { PureComponent } from 'react'
import { Text, View ,StyleSheet, Button} from 'react-native'

export default function Select ({navigation}){
   
    return (
       // <ImageBackground source={require('./assets/2.png')} style={styles.authContainer} resizeMode="stretch">

        <View style={styles.container}>
          <View style={styles.buttonContainer}>
          <Button title="Game 1" onPress={() => navigation.navigate("Game")} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Game 2" onPress={() =>  navigation.navigate("Game2")} />
        </View>
        </View>
       // </ImageBackground>
    );
  
}


const styles = StyleSheet.create({

    container:{
        flex:1,
        alignItems:"center",
        justifyContent:"center"
    },
    buttonContainer: {
        marginVertical: 10,
        width: '70%',
      },

});