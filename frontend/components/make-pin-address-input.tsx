import { StyleSheet } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export default function MakePinAddressInput({ address, handleAddressChange }) {
  const ADDRESS_MAX = 100;

  return (
    <>
      <GooglePlacesAutocomplete
        placeholder="Address"
        fetchDetails={true}
        onPress={(data, details = null) => {
          const address = data.description;
          handleAddressChange(address);
        }}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY,
          language: "en",
        }}
        textInputProps={{
          placeholderTextColor: "#aaaaaa",
          value: address,
          onChangeText: handleAddressChange,
          maxLength: ADDRESS_MAX + 1,
          onFocus: (event) =>
            scrollRef.current?.scrollToFocusedInput(event.target),
          style: [styles.input, addressError ? styles.inputError : null],
        }}
        styles={placesStyles}
      />

      {addressError ? (
        <Text style={styles.errorText}>{addressError}</Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
  },
  textInputContainer: {
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  textInput: {
    height: undefined,
    borderRadius: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: undefined,
    backgroundColor: "transparent",
    margin: 0,
  },
  listView: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 8,
    marginTop: 4,
  },
  row: {
    backgroundColor: "#ffffff",
    padding: 13,
  },
});
