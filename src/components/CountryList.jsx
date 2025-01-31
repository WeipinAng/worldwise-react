import { useCities } from "../contexts/CitiesContext";
import Spinner from "./Spinner";
import CountryItem from "./CountryItem";
import Message from "./Message";
import styles from "./CountryList.module.css";

function CountryList() {
    const { cities, isLoading } = useCities();

    if (isLoading) return <Spinner />;

    if (!cities.length)
        return (
            <Message message="Add your first city by clicking on a city on the map" />
        );

    const countries = cities.reduce(
        (arr, city) =>
            !arr.map((el) => el.country).includes(city.country)
                ? [...arr, { country: city.country, emoji: city.emoji }]
                : arr,
        []
    );

    return (
        <ul className={styles.countryList}>
            {countries.map((country) => (
                <CountryItem country={country} key={country.country} />
            ))}
        </ul>
    );
}

export default CountryList;
