import { createContext, useContext, useEffect, useReducer } from "react";

const BASE_URL = "http://localhost:9000";

const CitiesContext = createContext();

const initialState = {
    cities: [],
    isLoading: false,
    currentCity: {},
    error: "",
};

const ACTION_TYPES = Object.freeze({
    LOADING: "loading",
    CITIES_LOADED: "cities/loaded",
    CITY_LOADED: "city/loaded",
    CITY_CREATED: "city/created",
    CITY_DELETED: "city/deleted",
    REJECTED: "rejected",
});

function reducer(state, action) {
    switch (action.type) {
        case ACTION_TYPES.LOADING:
            return { ...state, isLoading: true };
        case ACTION_TYPES.CITIES_LOADED:
            return { ...state, isLoading: false, cities: action.payload };
        case ACTION_TYPES.CITY_LOADED:
            return { ...state, isLoading: false, currentCity: action.payload };
        case ACTION_TYPES.CITY_CREATED:
            return {
                ...state,
                isLoading: false,
                cities: [...state.cities, action.payload],
                currentCity: action.payload,
            };
        case ACTION_TYPES.CITY_DELETED:
            return {
                ...state,
                isLoading: false,
                cities: state.cities.filter(
                    (city) => city.id !== action.payload
                ),
                currentCity: {},
            };
        case ACTION_TYPES.REJECTED:
            return { ...state, isLoading: false, error: action.payload };
        default:
            throw new Error("Unknown action type");
    }
}

function CitiesProvider({ children }) {
    const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
        reducer,
        initialState
    );

    useEffect(function () {
        async function fetchCities() {
            dispatch({ type: ACTION_TYPES.LOADING });

            try {
                const res = await fetch(`${BASE_URL}/cities`);
                const data = await res.json();
                dispatch({ type: ACTION_TYPES.CITIES_LOADED, payload: data });
            } catch {
                dispatch({
                    type: ACTION_TYPES.REJECTED,
                    payload: "There was an error loading cities...",
                });
            }
        }
        fetchCities();
    }, []);

    async function getCity(id) {
        if (id === currentCity.id) return;

        dispatch({ type: ACTION_TYPES.LOADING });

        try {
            const res = await fetch(`${BASE_URL}/cities/${id}`);
            const data = await res.json();
            dispatch({ type: ACTION_TYPES.CITY_LOADED, payload: data });
        } catch {
            dispatch({
                type: ACTION_TYPES.REJECTED,
                payload: "There was an error loading the city...",
            });
        }
    }

    async function createCity(newCity) {
        dispatch({ type: ACTION_TYPES.LOADING });

        try {
            const res = await fetch(`${BASE_URL}/cities`, {
                method: "POST",
                body: JSON.stringify(newCity),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            dispatch({ type: ACTION_TYPES.CITY_CREATED, payload: data });
        } catch {
            dispatch({
                type: ACTION_TYPES.REJECTED,
                payload: "There was an error creating the city...",
            });
        }
    }

    async function deleteCity(id) {
        dispatch({ type: ACTION_TYPES.LOADING });

        try {
            await fetch(`${BASE_URL}/cities/${id}`, {
                method: "DELETE",
            });
            dispatch({ type: ACTION_TYPES.CITY_DELETED, payload: id });
        } catch {
            dispatch({
                type: ACTION_TYPES.REJECTED,
                payload: "There was an error deleting the city...",
            });
        }
    }

    return (
        <CitiesContext.Provider
            value={{
                cities,
                isLoading,
                currentCity,
                error,
                getCity,
                createCity,
                deleteCity,
            }}
        >
            {children}
        </CitiesContext.Provider>
    );
}

function useCities() {
    const context = useContext(CitiesContext);
    if (context === undefined)
        throw new Error("CitiesContext was used outside the CitiesProvider"); // access the content value in a place that is not a child component of the provider
    return context;
}

export { CitiesProvider, useCities };
