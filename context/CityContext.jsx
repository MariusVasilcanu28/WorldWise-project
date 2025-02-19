import { useEffect } from "react";
import { useReducer } from "react";
import { useContext } from "react";
import { useState } from "react";
import { createContext } from "react";

const CitiesContext = createContext();

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        isLoading: true,
      };
    case "cities/loaded":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
      };
    case "city/loaded":
      return {
        ...state,
        isLoading: false,
        currentCity: action.payload,
      };
    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };
    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };
    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    default:
      throw new Error("Unknown action type");
  }
}

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(() => {
    const fetchCities = async () => {
      dispatch({ type: "loading" });

      try {
        const res = await fetch(
          `${process.env.REACT_APP_WORLDWISE_API}/cities`
        );

        if (!res.ok) throw new Error("Failed to fetch cities");

        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch (err) {
        dispatch({
          type: "rejected",
          payload: "There was an error loading the data.",
        });
      }
    };

    fetchCities();
  }, []);

  const getCity = async (id) => {
    console.log(id, currentCity.id);
    if (id === currentCity.id) return;

    dispatch({ type: "loading" });

    try {
      const res = await fetch(
        `${process.env.REACT_APP_WORLDWISE_API}/cities/${id}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch cities");
      }
      const data = await res.json();
      dispatch({ type: "city/loaded", payload: data });
    } catch (err) {
      dispatch({
        type: "rejected",
        payload: "There was an error loading the city.",
      });
    }
  };

  const postCity = async (newCity) => {
    dispatch({ type: "loading" });

    try {
      const res = await fetch(`${process.env.REACT_APP_WORLDWISE_API}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("There was an error creating the city");
      }
      const data = await res.json();
      dispatch({ type: "city/created", payload: data });
    } catch (err) {
      dispatch({
        type: "rejected",
        payload: "There was an error creating the city.",
      });
    }
  };

  const deleteCity = async (id) => {
    dispatch({ type: "loading" });

    try {
      await fetch(`${process.env.REACT_APP_WORLDWISE_API}/cities/${id}`, {
        method: "DELETE",
      });

      dispatch({ type: "city/deleted", payload: id });
    } catch (err) {
      dispatch({
        type: "rejected",
        payload: "There was an error deleting the city.",
      });
    }
  };

  const getCountryCode = (input) => {
    // If input is exactly 2 letters (e.g., "RO"), assume it's already a country code.
    if (/^[A-Za-z]{2}$/.test(input)) {
      return input.toLowerCase();
    }

    // Otherwise, assume it's a flag emoji.
    return Array.from(input, (char) =>
      String.fromCharCode(char.codePointAt(0) - 127397)
    )
      .join("")
      .toLowerCase();
  };

  const flagemojiToPNG = (flag) => {
    // If there's no flag/emoji, return null or a fallback.
    if (!flag) return null;

    // Convert the input (flag emoji or country code) into a 2-letter country code.
    const countryCode = getCountryCode(flag);

    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt="U+1F1E6"
        title={flag}
      />
    );
  };

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        postCity,
        deleteCity,
        flagemojiToPNG,
        getCountryCode,
        error,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);

  if (context === undefined)
    throw new Error("CitiesContext was used outside the CitiesProvider");

  return context;
}

export { CitiesProvider, useCities };
