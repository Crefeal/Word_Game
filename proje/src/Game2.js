import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Pressable, Alert, Dimensions } from 'react-native';

const screenWidth = Dimensions.get("window").width;
const keyWidth = (screenWidth - 10) / 10;
const keyHeight = keyWidth * 1.3;

const colors = {
  black: "#121214",
  darkgrey: "#3A3A3D",
  grey: "#818384",
  lightgrey: "#D7DADC",
  primary: "#538D4E",
  secondary: "#B59F3B",
};

const ENTER = "ENTER";
const CLEAR = "CLEAR";

const Keyboard = ({
  onKeyPressed = () => {},
  greenCaps = [],
  yellowCaps = [],
  greyCaps = [],
}) => {
  const isLongButton = (key) => {
    return key === ENTER || key === CLEAR;
  };

  const getKeyBGColor = (key) => {
    if (greenCaps.includes(key)) {
      return colors.primary;
    }
    if (yellowCaps.includes(key)) {
      return colors.secondary;
    }
    if (greyCaps.includes(key)) {
      return colors.darkgrey;
    }
    return colors.grey;
  };

  return (
    <View style={styles.keyboard}>
      {[["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        [ENTER, "z", "x", "c", "v", "b", "n", "m", CLEAR]].map((keyRow, i) => (
        <View style={styles.KeyboardRow} key={`row-${i}`}>
          {keyRow.map((key) => (
            <Pressable
              onPress={() => onKeyPressed(key)}
              key={key}
              style={[
                styles.key,
                isLongButton(key) ? { width: keyWidth * 1.4 } : {},
                { backgroundColor: getKeyBGColor(key) },
              ]}
            >
              <Text style={styles.keyText}>{key.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
};

export default function Game2({ navigation }) {
  const wordPool = ["radio", "arrive", "dream", "brush", "tree", "angry", "fuel", "press", "soft","rule"];
  const [word, setWord] = useState("");
  const [letters, setLetters] = useState([]);
  const [curCol, setCurCol] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(0);
  const [correctLetters, setCorrectLetters] = useState(Array(word.length).fill(false));
  const [time, setTime] = useState(60);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * wordPool.length);
    const randomWord = wordPool[randomIndex];
    setWord(randomWord);
    setLetters(new Array(randomWord.length).fill(""));
    setAttemptsLeft(randomWord.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (time > 0) {
        setTime(time - 1);
      } else {
        clearInterval(timer);
        Alert.alert("You Lost the Game!", "Time's up.");
        navigation.navigate("Waiting");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [time]);

  const checkGameState = () => {
    if (checkIfWon()) {
      Alert.alert("Congratulations!", "You Won the Game");
      navigation.navigate("Waiting");
    } else if (checkIfLost()) {
      Alert.alert("You lost the game!", "Your number of attempts is over.");
      navigation.navigate("Waiting");
    }
  };

  const checkIfWon = () => {
    return correctLetters.every((isCorrect) => isCorrect);
  };

  const checkIfLost = () => {
    return attemptsLeft === 0;
  };

  const onKeyPressed = (key) => {
    if (key === CLEAR) {
      const prevCol = curCol - 1;
      if (prevCol >= 0) {
        letters[prevCol] = "";
        setCurCol(prevCol);
      }
    } else if (key === ENTER) {
      if (curCol === word.length) {
        if (letters.join("") === word) {
          setCorrectLetters(new Array(word.length).fill(true));
          checkGameState();
        } else {
          setAttemptsLeft(attemptsLeft - 1);
          if (attemptsLeft === 1) {
            Alert.alert("You lost the game!", "Your number of attempts is over.");
            navigation.navigate("Waiting");
          } else {
            Alert.alert("Wrong Guess!", "Please try again");
            setLetters(new Array(word.length).fill(""));
            setCurCol(0);
          }
        }
      }
    } else if (curCol < word.length) {
      letters[curCol] = key;
      setCurCol(curCol + 1);
    }
  };

  const getCellBGColor = (col, letter) => {
    if (correctLetters[col] && letter.toUpperCase() === word[col].toUpperCase()) {
      return colors.primary;
    } else if (col >= curCol) {
      return colors.black;
    }
    return colors.black;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>WORDMANIA</Text>
      <Text style={styles.timer}>Time: {time} second</Text>
      <Text style={styles.attemptsLeft}>Remaining Trial Right: {attemptsLeft}</Text>
      <ScrollView style={styles.map}>
        <View style={styles.row}>
          {letters.map((letter, j) => (
            <View
              key={`cell-${j}`}
              style={[
                styles.cell,
                { backgroundColor: getCellBGColor(j, letter) },
              ]}
            >
              <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <Keyboard onKeyPressed={onKeyPressed} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: 'center',
  },
  title: {
    color: colors.lightgrey,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 5,
    marginTop: 40,
  },
  timer: {
    color: colors.lightgrey,
    fontSize: 20,
    marginTop: 10,
  },
  attemptsLeft: {
    color: colors.lightgrey,
    fontSize: 18,
    marginTop: 10,
  },
  map: {
    height: 100,
    alignSelf: "stretch",
    marginVertical: 20,
  },
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  cell: {
    flex: 1,
    height: 30,
    borderWidth: 2,
    borderColor: colors.grey,
    aspectRatio: 1,
    margin: 4,
    maxWidth: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  cellText: {
    color: colors.lightgrey,
    fontWeight: "bold",
    fontSize: 24,
  },
  keyboard: {
    alignSelf: "stretch",
    marginTop: "auto",
  },
  key: {
    width: keyWidth - 4,
    height: keyHeight - 4,
    margin: 2,
    borderRadius: 5,
    backgroundColor: colors.grey,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: {
    color: colors.lightgrey,
    fontWeight: "bold",
  },
  KeyboardRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
    marginLeft: 10,
  },
});
