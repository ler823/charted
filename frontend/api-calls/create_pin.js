import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

export const createPin = async (pin_data) => {
    url = API_URL + "/createpin"
    const response = await fetch(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ pin_data })
        }
    );

    if (!response.ok) {
        throw new Error("Request failed");
    }

    return await response.json();
};