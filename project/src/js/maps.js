/**
 * Google Maps integration for HyteGym
 * This file provides the functionality for displaying gym locations on Google Maps
 */

let map;
let markers = [];
let infoWindows = [];

/**
 * Initialize the Google Maps
 */
function initMap() {
  // Default center (Helsinki)
  const helsinkiCenter = { lat: 60.1695, lng: 24.9354 };
  
  // Create the map instance
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 11,
    center: helsinkiCenter,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: getMapStyles()
  });
  
  // Add gym markers
  addGymMarkers();
  
  // Add user's current location if possible
  addCurrentLocationMarker();
}

/**
 * Add markers for each gym location
 */
function addGymMarkers() {
  // Get gym locations from DOM
  const gymLocations = document.querySelectorAll('.gym-location');
  
  // Create a bounds object to fit all markers
  const bounds = new google.maps.LatLngBounds();
  
  // Add markers for each gym
  gymLocations.forEach(gym => {
    const lat = parseFloat(gym.dataset.lat);
    const lng = parseFloat(gym.dataset.lng);
    const title = gym.querySelector('h4').innerText;
    const position = { lat, lng };
    
    // Add marker
    const marker = new google.maps.Marker({
      position: position,
      map: map,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
      }
    });
    
    // Create info window with gym details
    const infoContent = `
      <div style="color: #333; padding: 5px; max-width: 200px;">
        <strong>${title}</strong><br>
        ${gym.querySelector('.gym-address').innerText}<br>
        ${gym.querySelector('.gym-hours').innerText}
      </div>
    `;
    
    const infoWindow = new google.maps.InfoWindow({
      content: infoContent
    });
    
    // Store info window
    infoWindows.push(infoWindow);
    
    // Add click listener to marker
    marker.addListener('click', () => {
      // Close all open info windows first
      infoWindows.forEach(window => window.close());
      
      // Open this info window
      infoWindow.open(map, marker);
    });
    
    // Store marker
    markers.push(marker);
    
    // Extend bounds to include this marker
    bounds.extend(position);
  });
  
  // If we have markers, fit the map to show all of them
  if (markers.length > 0) {
    map.fitBounds(bounds);
    
    // If we only have one marker, zoom out a bit
    if (markers.length === 1) {
      map.setZoom(15);
    }
  }
}

/**
 * Add a marker for the user's current location if geolocation is available
 */
function addCurrentLocationMarker() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Add user location marker
        const marker = new google.maps.Marker({
          position: userLocation,
          map: map,
          title: 'Sinun sijaintisi',
          animation: google.maps.Animation.DROP,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          }
        });
        
        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: '<div style="color: #333; padding: 5px;">Sinun sijaintisi</div>'
        });
        
        // Add click listener
        marker.addListener('click', () => {
          infoWindows.forEach(window => window.close());
          infoWindow.open(map, marker);
        });
        
        // Add to markers and info windows arrays
        markers.push(marker);
        infoWindows.push(infoWindow);
        
        // Show nearest gym calculation
        findNearestGym(userLocation);
      },
      (error) => {
        console.log('Geolocation error:', error);
      }
    );
  }
}

/**
 * Find the nearest gym to the user's location
 */
function findNearestGym(userLocation) {
  let nearestGym = null;
  let shortestDistance = Infinity;
  
  // Get gym locations from DOM
  const gymLocations = document.querySelectorAll('.gym-location');
  
  // Find nearest gym
  gymLocations.forEach(gym => {
    const lat = parseFloat(gym.dataset.lat);
    const lng = parseFloat(gym.dataset.lng);
    const gymPosition = { lat, lng };
    
    // Calculate distance
    const distance = getDistance(userLocation, gymPosition);
    
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestGym = gym;
    }
  });
  
  // Highlight nearest gym
  if (nearestGym) {
    nearestGym.classList.add('nearest-gym');
    nearestGym.innerHTML += `
      <div class="nearest-badge">
        <strong>Lähin sali!</strong> Etäisyys: ${(shortestDistance / 1000).toFixed(1)} km
      </div>
    `;
  }
}

/**
 * Calculate distance between two points in meters
 */
function getDistance(point1, point2) {
  // Haversine formula to calculate distance between two points on Earth
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1.lat * Math.PI / 180;
  const φ2 = point2.lat * Math.PI / 180;
  const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
  const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
           Math.cos(φ1) * Math.cos(φ2) *
           Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

/**
 * Center the map on a specific location
 */
function centerMap(lat, lng) {
  if (map) {
    // Center map
    map.setCenter({ lat, lng });
    map.setZoom(15);
    
    // Close all info windows
    infoWindows.forEach(window => window.close());
    
    // Find and open the info window for this marker
    markers.forEach(marker => {
      const position = marker.getPosition();
      if (position.lat() === lat && position.lng() === lng) {
        // Trigger click event on marker
        google.maps.event.trigger(marker, 'click');
      }
    });
  }
}

/**
 * Get custom map styles
 */
function getMapStyles() {
  return [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#181818"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#1b1b1b"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#2c2c2c"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#8a8a8a"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#373737"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#3c3c3c"
        }
      ]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#4e4e4e"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#3d3d3d"
        }
      ]
    }
  ];
}

// Expose functions to the global scope for use in HTML
window.initMap = initMap;
window.centerMap = centerMap;