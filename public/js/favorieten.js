// FAVORIETEN
let favoriteMap = L.map("mapid").setView([51.2194475, 4.4024643], 12);
L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
        attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/streets-v11",
        tileSize: 512,
        zoomOffset: -1,
        accessToken: myToken // accesToken = environment-variable
    }
).addTo(favoriteMap);

// Deze layergroup wordt hier gedeclareerd en gebruikt in "showFavoriteMarkers"
let layerFavorieten = L.layerGroup().addTo(favoriteMap);

/* Met deze functie halen we de favoriete locaties die in de database staan op zodat k markers ervoor kan tonen*/
async function getDataFromDatabase() {
    const response = await fetch('/api');
    const data = await response.json();
    return new Promise((resolve, reject) => {
        if (data) {
            resolve(data);
        } else {
            reject("Er is iets misgegaan bij het ophalen van favorieten");
        }
    })
};
/* Met deze functie tonen we de markers voor de favoriete locaties */
async function showFavoriteMarkers() {
    console.log('Ik zit in de functie');
    let favoriteLocations = await getDataFromDatabase();
    console.log('Ik heb de data uit de database gelezen');
    let favoriteWifi = favoriteLocations.filter(location => location.attributes.LOCATIE !== undefined);
    let favoriteWeb = favoriteLocations.filter(location => location.attributes.LOCATIE === undefined);
    wifiAddLayer(favoriteWifi, layerFavorieten);
    ComputerAddLayer(favoriteWeb, layerFavorieten);
};
/* Functie om opgevraagde locatie op te slaan --> wordt gebruikt in "route.js" */
function showRoute() {
    let routeLinks = document.querySelectorAll('.route-link-favorieten');
    routeLinks.forEach(link => {
        link.addEventListener('click', e => {
            let target = e.currentTarget;
            let parent = target.parentElement;
            let grandParent = parent.previousElementSibling.innerText; // Dit geeft me de naam van de locatie
            let alleData = [...wifiPoints, ...computerRooms];
            for (let i = 0; i < alleData.length; i++) {
                if (alleData[i].attributes.LOCATIE === grandParent) {
                    sessionStorage.setItem("requestedLocation", JSON.stringify(alleData[i]));
                }
            }
        })
    })

}
async function sendObjectToDelete() {
    let displayedFavoriteLocations = document.querySelectorAll('.verwijder-favoriet');
    displayedFavoriteLocations.forEach(location => {
        location.addEventListener('click', async (e) => {
            let target = e.currentTarget;
            let parent = target.parentElement;
            let grandParent = parent.previousElementSibling.innerText; // Dit geeft me de naam van de locatie
            let alleData = [...wifiPoints, ...computerRooms];
            for (let i = 0; i < alleData.length; i++) {
                if (alleData[i].attributes.LOCATIE === grandParent) {   // Hier krijg ik het gewenste object te pakken
                    const options = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(alleData[i])
                    }
                    fetch('/verwijder', options).then(() => showFavoriteMarkers());
                } else if (alleData[i].attributes.NAAM === grandParent) {
                    const options = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(alleData[i])
                    }
                    fetch('/verwijder', options).then(() => showFavoriteMarkers());
                }
            }
            // de locatie doen vervagen
            $(e.currentTarget).parent().fadeOut();
            $(e.currentTarget).parent().prev().fadeOut();
            // de layergroup refreshen
            layerFavorieten.clearLayers();
        });
    });
};

// De volgende functies voeren we uit:
(async () => {
    console.log("ik wordt uitgevoerd");
    openNav();
    let favoriteData  = await getDataFromDatabase();
    showFavoriteMarkers();  // De markers tonen voor alle favorieten
    ZoomIn(favoriteData, favoriteMap);   // Klik op adres en zoomt in op de markers
    showRoute();   // De route naar dat punt kunnen tonen

    sendObjectToDelete();   // De locaties kunnen verwijderen
})();