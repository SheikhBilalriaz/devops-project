import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './App.css';

const BASE_URL = import.meta.env.VITE_WEATHER_API;
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

export default function WeatherApp() {
  const [weather, setWeather] = useState<any>(null);
  const [hourly, setHourly] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `${BASE_URL}forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=1&aqi=no&alerts=no`
          );

          const data = response.data;
          setCity(data.location.name);
          setCountry(data.location.country);
          setWeather(data.current);
          setHourly(
            data.forecast.forecastday[0].hour.slice(
              new Date().getHours(),
              new Date().getHours() + 12
            )
          );
          setError(null);
        } catch (err) {
          setError('Unable to fetch weather or location data');
        }
      },
      () => {
        setError('Location access denied');
      }
    );
  }, []);

  // Chart data
  const chartData = {
    labels: hourly.map((hour) =>
      new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    ),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: hourly.map((hour) => hour.temp_c),
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.25)',
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#fbb6ce', font: { size: 16, weight: 'bold' as const } },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleColor: 'white',
        bodyColor: 'white',
      },
    },
    scales: {
      x: {
        ticks: { color: '#fbb6ce', font: { size: 14 } },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      y: {
        ticks: { color: '#fbb6ce', font: { size: 14 } },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8 relative overflow-hidden text-gray-100 font-sans">
      {/* Background glows */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-pink-600 opacity-30 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-purple-600 opacity-20 blur-3xl"></div>

      <div className="max-w-7xl w-full grid md:grid-cols-3 gap-12 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-10 z-10">
        {/* Left panel */}
        <section className="md:col-span-1 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-400 rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden shadow-lg">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/20 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold tracking-wide drop-shadow-xl">{city}, {country}</h2>
            <p className="text-sm opacity-90 mb-8 drop-shadow-lg">{new Date().toLocaleDateString()}</p>
            <div className="flex items-center space-x-8">
              <p className="text-8xl font-extrabold drop-shadow-2xl animate-pulse">{weather ? `${weather.temp_c}°` : '--'}</p>
              <img src={weather?.condition?.icon} alt={weather?.condition?.text} className="w-28 h-28 drop-shadow-2xl" />
            </div>
            <p className="mt-6 text-3xl capitalize tracking-wide drop-shadow-xl font-semibold">{weather?.condition?.text || 'Loading...'}</p>
          </div>
        </section>

        {/* Right panel */}
        <section className="md:col-span-2 bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-10 shadow-2xl text-gray-100">
          <h1 className="text-5xl font-extrabold mb-12 drop-shadow-lg">Welcome back!</h1>
          <p className="text-xl mb-12 drop-shadow-md">Check out today's weather information</p>

          {/* Chart */}
          <div className="mb-12 rounded-xl shadow-lg p-6 bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-400">
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Weather details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { label: 'Humidity', value: `${weather?.humidity || '--'}%` },
              { label: 'Wind', value: `${weather?.wind_kph || '--'} km/h` },
              { label: 'Feels Like', value: `${weather?.feelslike_c || '--'}°` },
              { label: 'UV Index', value: weather?.uv || '--' },
              { label: 'Pressure', value: `${weather?.pressure_mb || '--'} hPa` },
              { label: 'Visibility', value: `${weather?.vis_km || '--'} km` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-gradient-to-br from-pink-600 via-red-600 to-yellow-400 p-8 rounded-3xl shadow-xl text-center cursor-default transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <p className="font-semibold text-2xl mb-6 text-white drop-shadow-lg">{label}</p>
                <p className="text-6xl font-extrabold text-white drop-shadow-xl">{value}</p>
              </div>
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-center text-xl mt-12 drop-shadow-xl">{error}</p>
          )}
        </section>
      </div>
    </div>
  );
}
