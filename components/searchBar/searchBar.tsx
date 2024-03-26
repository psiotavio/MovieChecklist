import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useUser } from "../../contexts/UserContext";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (movie: { title: string; rating: number }) => void; // Adapte conforme necessário
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSelectSuggestion,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { movies } = useUser(); // Use filmes do contexto
  const [filteredSuggestions, setFilteredSuggestions] = useState<{ title: string; rating: number }[]>([]);

  useEffect(() => {
    if (value) {
      const lowercasedValue = value.toLowerCase();
      setFilteredSuggestions(
        movies.filter((movie) =>
          movie.title.toLowerCase().includes(lowercasedValue)
        )
      );
    } else {
      setFilteredSuggestions([]);
    }
  }, [value, movies]);

  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
      setIsFocused(false);
    }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => inputRef.current?.focus()}>
          <AntDesign name="search1" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Digite o nome do filme"
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
          />
          {isFocused && filteredSuggestions.length > 0 && (
            <ScrollView style={styles.suggestionsContainer}>
              {filteredSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => {
                    onSelectSuggestion(suggestion);
                    setIsFocused(false);
                  }}
                >
                  <Text>{suggestion.title}</Text> {/* Use o título do filme como sugestão */}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
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
    position: 'relative', // Add this to contain the absolute suggestions container
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingLeft: 8,
  },
  suggestionsContainer: {
    position: 'absolute', // Make suggestions absolute
    top: 40, // Position below the input field
    width: '100%', // Make the suggestions container as wide as the input container
    maxHeight: 200,
    backgroundColor: "#f2f2f2",
    zIndex: 1000, // Ensure the list is above other content
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default SearchBar;
