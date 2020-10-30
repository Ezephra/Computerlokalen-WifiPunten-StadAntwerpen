let routeMap = L.map('mapidRoute').setView([51.2194475, 4.4024643], 12);

L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
        attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/streets-v11",
        tileSize: 512,
        zoomOffset: -1,
        accessToken: myToken
    }
).addTo(routeMap);

// Als locatiebepaling niet aan staat willen we dit aan de user laten weten
if (navigator.geolocation === false) {
    alert('We kunnen je locatie niet bepalen.');
}

// Icoon nog veranderen..
let route_icon = L.icon({
    iconUrl: "images/route_icon.svg",
    iconSize: [40, 40],
    popupAnchor: [0, -15]
});

// Als we het beginpunt hebben (user's locatie) én het eindpunt (opgeslagen locatie) dan tonen we de route
if (navigator.geolocation && sessionStorage.length !== 0) {
    // De coordinaten van het opgevraagde locatie
    let locatie = sessionStorage.getItem("requestedLocation");
    let destination = JSON.parse(locatie);

    let destinationY = destination.geometry.y;
    let destinationX = destination.geometry.x;

    navigator.geolocation.getCurrentPosition(location => {
        L.Routing.control({
            waypoints: [
                L.latLng(location.coords.latitude, location.coords.longitude),
                L.latLng(destinationY, destinationX)
            ],
            router: L.Routing.mapbox(routeToken, { language: 'nl' }),
            lineOptions: {
                styles: [{
                    color: '#0060ad', opacity: 1, weight: 3 }]
            },
            routeWhileDragging: true,
            collapsible: true,
            autoRoute: true,
            reverseWaypoints: true,
            geocoder: L.Control.Geocoder.nominatim(),
            createMarker: function (i, wp, nWps) {
                if (i === 0 || i === nWps - 1) {
                    // here change the starting and ending icons
                    return L.marker(wp.latLng, {
                        icon: route_icon // here pass the custom marker icon instance
                    });
                }
            }
        })
        .on('routingstart', showSpinner)
        .on('routesfound', hideSpinner)
        .on('routingerror', () => console.log("Ik heb geen route kunnen vinden"))
        .addTo(routeMap);
    });
}
/* We komen in de else-statement als de user niet via een locatie in de lijst is gekomen op de route-pagina, maar heeft geklikt op "NAVIGATIE"
 * In dat geval geven we de mogelijkheid om zelf een begin- en eindlocatie in te geven */
else {
    L.Routing.control({
        router: L.Routing.mapbox(routeToken, { language: 'nl' }),
        lineOptions: {
            styles: [{
                color: '#0060ad', opacity: 1, weight: 3
            }]
        },
        routeWhileDragging: true,
        collapsible: true,
        autoRoute: true,
        reverseWaypoints: true,
        geocoder: L.Control.Geocoder.nominatim(),
        createMarker: function (i, wp, nWps) {
            if (i === 0 || i === nWps - 1) {
                // here change the starting and ending icons
                return L.marker(wp.latLng, {
                    icon: route_icon // here pass the custom marker icon instance
                });
            }
        }
    })
    .on('routingstart', showSpinner)
    .on('routesfound', hideSpinner)
    .on('routingerror', () => console.log("Ik heb geen route kunnen vinden"))
    .addTo(routeMap);
};

function showSpinner() {
    document.querySelector('.spinner-btn').classList.remove('hidden');
}
function hideSpinner() {
    $('.spinner-btn').fadeOut();
}