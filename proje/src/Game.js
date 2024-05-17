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
        <View style={styles.row} key={`row-${i}`}>
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

export default function Game({ navigation }) {
  const wordPool = ["radio","arrive","dream","quick","novel","fuel","press","soft"];
  const [word, setWord] = useState("");
  const [letters, setLetters] = useState([]);
  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);
  const [gameState, setGameState] = useState("playing");
  const [rows, setRows] = useState([]);
  const [time, setTime] = useState(60);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * wordPool.length);
    const randomWord = wordPool[randomIndex];
    const randomLetters = randomWord.split("");
    setWord(randomWord);
    setLetters(randomLetters);
    setRows(new Array(randomLetters.length).fill(new Array(randomLetters.length).fill("")));
  }, []);

  useEffect(() => {
    if (curRow > 0) {
      checkGameState();
    }
  }, [curRow]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (time > 0) {
        setTime(time - 1);
      } else {
        clearInterval(timer);
        Alert.alert("You Lost the Game!", "Time's up.");
        setGameState("lost");
        navigation.navigate("Waiting");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [time]);

  const checkGameState = () => {
    if (checkIfWon()) {
      Alert.alert("Congratulations!", "You Won the Game");
      setGameState("won");
      navigation.navigate("Waiting");
    } else if (checkIfLost()) {
      Alert.alert("You lost the game!", "Your number of attempts is over.");
      setGameState("lost");
      navigation.navigate("Waiting");
    }
  };

  const checkIfWon = () => {
    const row = rows[curRow - 1];
    return row.every((letter, i) => letter === letters[i]);
  };

  const checkIfLost = () => {
    return curRow === rows.length;
  };

  const onKeyPressed = (key) => {
    const updatedRows = [...rows];
    if (key === CLEAR) {
      const prevCol = curCol - 1;
      if (prevCol >= 0) {
        updatedRows[curRow][prevCol] = "";
        setRows(updatedRows);
        setCurCol(prevCol);
      }
    } else if (key === ENTER) {
      if (curCol === rows[0].length) {
        setCurRow(curRow + 1);
        setCurCol(0);
      }
    } else if (curCol < rows[0].length) {
      updatedRows[curRow] = [...rows[curRow]];
      updatedRows[curRow][curCol] = key;
      setRows(updatedRows);
      setCurCol(curCol + 1);
    }
  };

  const isCellActive = (row, col) => {
    return row === curRow && col === curCol;
  };

  const getCellBGColor = (letter, row, col) => {
    if (row >= curRow) {
      return colors.black;
    }
    if (letter === letters[col]) {
      return colors.primary;
    }
    if (letters.includes(letter)) {
      return colors.secondary;
    }
    return colors.darkgrey;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>WORDMANIA</Text>
      <Text style={styles.timer}>Time: {time} second</Text>
      <ScrollView style={styles.map}>
        {rows.map((row, i) => (
          <View key={`row-${i}`} style={styles.row}>
            {row.map((letter, j) => (
              <View
                key={`cell-${i}-${j}`}
                style={[
                  styles.cell,
                  { borderColor: isCellActive(i, j) ? colors.lightgrey : colors.darkgrey },
                  { backgroundColor: getCellBGColor(letter, i, j) },
                ]}
              >
                <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        ))}
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
  map: {
    height: 100,
    alignSelf: "stretch",
    marginVertical: 20,
  },
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
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
    fontSize: 28,
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
});
