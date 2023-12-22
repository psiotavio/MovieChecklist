// SearchBar.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Animated,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

interface SearchBarProps<T> {
  value: string;
  onChangeText: (text: string) => void;
  suggestions: T[];
  onSelectSuggestion: (suggestion: T) => void;
}

const SearchBar = <T extends unknown>({
  value,
  onChangeText,
  suggestions,
  onSelectSuggestion,
}: SearchBarProps<T>) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => {}}>
        <AntDesign name="search1" size={24} color="black" />
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite o nome do filme"
          value={value}
          onChangeText={onChangeText}
        />
        <ScrollView style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => onSelectSuggestion(suggestion)}
            >
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "95%",
    flexDirection: "row",
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    overflow: "hidden",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingLeft: 8,
  },
  suggestionsContainer: {
    maxHeight: 200,
    backgroundColor: "#f2f2f2",
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default SearchBar;
