"use client"
import Card from "./components/Card";
import ApiClient from "../../ApiClient/client"
import { useState, useEffect } from "react"
import { Sixtyfour } from "next/font/google";

const sixtyfourFont = Sixtyfour({
  subsets: ["latin"],
  weight: "400"
});

export default function Home() {

  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState({
    "latitude": 51.5085,
    "longitude": -0.1257
  })
  const [error, setError] = useState(null)
  const [recievedUserData, setRecievedUserData] = useState(false)
  const [userLocationName, setUserLocationName] = useState("")
  const [selectedCity, setSelectedCity] = useState("London")
  const client = new ApiClient()

  const cityCoords = {
  "London": { latitude: 51.5085, longitude: -0.1257 },
  "New York": { latitude: 40.7128, longitude: -74.006 },
  "Paris": { latitude: 48.8566, longitude: 2.3522 },
  "Tokyo": { latitude: 35.6895, longitude: 139.6917 }
  };

  const changeLocation = (cityName) => {
  if (cityName === "Your Location"){
    getUserLocation()
  } else if (cityCoords[cityName]) {
    setLocation(cityCoords[cityName]);
  }
  };

  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
      const userCoords = { 
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
      setLocation(userCoords)
      setRecievedUserData(true)
    },
    (error) => {
      console.log("Geolocation error: ", error)
      setRecievedUserData(false)
    }
  )
  }

  const fetchDays = async () => {
    setLoading(true)
    try {
      const response = await client.getForecast({location})
      const daily = response.data.daily
      const formattedDays = daily.time.map((date, index) => ({
        date,
        condition: daily.weathercode[index],
        minTemp: daily.temperature_2m_min[index],
        maxTemp: daily.temperature_2m_max[index],
        wind: daily.wind_speed_10m_max[index],
      }))

      setDays(formattedDays)
      setError(null)
    } catch (error) {
      setError("Oops! Something went wrong!")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserLocationName = async () => {
    try {
      const userLocationData = await client.getLocationName({location})
      let userLocation = ""
      if (userLocationData.data.address.town) {
        userLocation = userLocationData.data.address.town
      } else if (userLocationData.data.address.city) {
        userLocation = userLocationData.data.address.city
      } else {
        userLocation = "Your Location"
      }
      setUserLocationName(userLocation)
      setSelectedCity(userLocation)
    } catch (error) {
      console.log("Error fetching user location name: ", error)
      setSelectedCity("Your Location")
    }
  }

  useEffect(() => {
    getUserLocation()
  }, [])

  useEffect(() => {
    if (recievedUserData) {
      fetchUserLocationName()
    }
  }, [recievedUserData])

  useEffect(() => {
    fetchDays()
  }, [location])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-yellow-50">
      {
        error && <div className="text-red-500">
          {error}
        </div>
      }
      <h1 className={`text-center text-5xl mt-20 m-15 ${sixtyfourFont.className}`}>WEATHER FORECAST</h1>
      <select value={selectedCity} className="px-4 py-2 mb-5 text-yellow-900 rounded-md shadow-md font-medium bg-yellow-200 border-yellow-400 border"
        onChange={(e) => {
          setSelectedCity(e.target.value)
          changeLocation(e.target.value)
        }}
        >
        { recievedUserData && (
        <option value="Your Location">{userLocationName}</option> 
        )}
        <option value="London">London</option> 
        <option value="New York">New York</option>
        <option value="Paris">Paris</option>
        <option value="Tokyo">Tokyo</option>
      </select>
      {loading? (
        <div className="text-center p-4">Loading...</div>
      ) : (
          days.map((day, index) => (
            <Card 
            key={index}
            date={day.date}
            weatherCode={day.condition}
            minTemp={`${day.minTemp}`}
            maxTemp={`${day.maxTemp}`}
            wind={`${day.wind}`}
            />
        ))
      )
    }
    </div>
  );
}