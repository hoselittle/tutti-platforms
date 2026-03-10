'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Link from 'next/link';

// These imports are required to make Leaflet look right in Next.js
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';

// We'll center the map on Sydney by default
const SYDNEY_CENTER = [-33.8688, 151.2093];

export default function JobsMap({ jobs }) {
  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden border border-zinc-200 shadow-sm z-0 relative">
      <MapContainer 
        center={SYDNEY_CENTER} 
        zoom={11} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* OpenStreetMap TileLayer (Free and open source imagery) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Loop through our jobs and place a pin for any job that has coordinates */}
        {jobs.map((job) => {
          if (!job.latitude || !job.longitude) return null;

          return (
            <Marker key={job.id} position={[job.latitude, job.longitude]}>
              <Popup>
                <div className="p-1 min-w-[150px]">
                  <h3 className="font-semibold text-sm mb-1">{job.title}</h3>
                  <p className="text-xs text-zinc-500 mb-2">
                    {job.location_postcode} • {job.exam_type?.toUpperCase()}
                  </p>
                  <Link 
                    href={`/pianist/jobs/${job.id}`}
                    className="text-xs text-blue-600 hover:underline font-medium block"
                  >
                    View Job Details &rarr;
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}