let mymap = L.map("mapid").setView([51.2194475, 4.4024643], 12);

let tileLayer = L.tileLayer(
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
).addTo(mymap);
mymap.scrollWheelZoom.disable();

// Deze 2 layergroups worden hier gedeclareerd en worden gebruikt in de eventListener op de keuzeButtons
let layerFreeWifi = L.layerGroup().addTo(mymap);
let layerComputerruimten = L.layerGroup().addTo(mymap);

/* Naargelang het gekozen data tonen we een verschillende hoofding, dat wordt door deze functie geregeld */
function showHeading(keuze) {
	let elHeading = document.getElementById("heading");
	let elParagraph = document.getElementById("paragraph");
	let elSpan = document.querySelector(".vervolgtekst");
	elLinkLocaties.classList.remove("hidden");
	if (keuze == "wifi") {
		elHeading.textContent = "Openbare Wifipunten";
		elParagraph.textContent = "In Antwerpen kan u op veel plaatsen gratis wifi gebruiken. Zo surft u gratis met uw laptop, smartphone of tablet. ";
		elSpan.textContent = " om alle wifipunten in een lijst te tonen."
	}
	else if (keuze == "computer") {
		elHeading.textContent = "Openbare Computerruimten";
		elParagraph.textContent = "Een webpunt is een openbare computerruimte. Je kan er vrij gebruik maken van de computers en er is altijd een medewerker aanwezig om je te helpen. ";
		elSpan.textContent = " om alle webpunten in een lijst te tonen."
	}
}

// De 2 keuze-buttons
let wifiPuntenBtn = document.getElementById("wifipunten");
let computerRuimtenBtn = document.getElementById("computerruimten");

let elLinkLocaties = document.querySelector(".link-locaties");
let openSideNavBtn = document.querySelector(".openbtn");

// Als er wordt geklikt op WIFIPUNTEN:
wifiPuntenBtn.addEventListener('click', () => {
	computerRuimtenBtn.classList.remove("keuzeBtn-active");
	wifiPuntenBtn.classList.add("keuzeBtn-active");
	document.getElementById("open").classList.remove("hidden");

	showHeading("wifi");
	mymap.removeLayer(layerComputerruimten);
	mymap.addLayer(layerFreeWifi);
	wifiAddLayer(wifiPoints, layerFreeWifi);
	elLinkLocaties.style.display = "initial";
	elLinkLocaties.addEventListener('click', () => {
		openNav();
		document.querySelector('.list-webPoints').classList.add('hidden');
		document.querySelector('.list-wifiPoints').classList.remove('hidden');
	})
	openSideNavBtn.addEventListener('click', () => {
		document.querySelector('.list-webPoints').classList.add('hidden');
		document.querySelector('.list-wifiPoints').classList.remove('hidden');
	})
	ZoomIn(wifiPoints, mymap);
})
// Als er wordt geklikt op WEBPUNTEN:
computerRuimtenBtn.addEventListener('click', () => {
	wifiPuntenBtn.classList.remove("keuzeBtn-active");
	computerRuimtenBtn.classList.add("keuzeBtn-active");
	document.getElementById("open").classList.remove("hidden");

	showHeading("computer");
	mymap.removeLayer(layerFreeWifi);
	mymap.addLayer(layerComputerruimten);
	ComputerAddLayer(computerRooms, layerComputerruimten);
	elLinkLocaties.addEventListener('click', () => {
		openNav();
		document.querySelector('.list-wifiPoints').classList.add('hidden');
		document.querySelector('.list-webPoints').classList.remove('hidden');
	})
	openSideNavBtn.addEventListener('click', () => {
		document.querySelector('.list-wifiPoints').classList.add('hidden');
		document.querySelector('.list-webPoints').classList.remove('hidden');
	})
	ZoomIn(computerRooms, mymap);
})

// ROUTING (opgevraagde locatie opslaan --> wordt in "routing_leaflet.js" opgehaald en gebruikt)
let wifiRouteLinks = document.querySelectorAll(".route-link-wifi");
let webRouteLinks = document.querySelectorAll(".route-link-web");

function storeRequestedLocation(routeLinks, data) {
	for (let i = 0; i < routeLinks.length; i++) {
		routeLinks[i].addEventListener('click', () => {
			sessionStorage.setItem("requestedLocation", JSON.stringify(data[i]));
		});
	}
}
storeRequestedLocation(wifiRouteLinks, wifiPoints);
storeRequestedLocation(webRouteLinks, computerRooms);

// FAVORIETEN OPSLAAN
/* Deze functie gaat op alle "voeg toe aan favorieten"-links een eventListener plaatsen, die ervoor zorgt
 * dat het geklikte locatie gestuurd wordt naar de server en vandaar wordt het weggeschreven naar de database */
let allFavoriteWifi = document.querySelectorAll('.favoriet-wifi');
let allFavoriteWeb = document.querySelectorAll('.favoriet-web');
function sendFavoriteLocationToServer(dataLength, data) {
	for (let i = 0; i < dataLength.length; i++) {
		dataLength[i].addEventListener('click', async () => {
			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data[i])
			}
			if (data[i].attributes.LOCATIE !== undefined) {
				alert(`${wifiPoints[i].attributes.LOCATIE} is toegevoegd aan u favorieten`)
			} else {
				alert(`${computerRooms[i].attributes.NAAM} is toegevoegd aan u favorieten`)
			}
			await fetch('/favorieten', options);
		})
	}
}
sendFavoriteLocationToServer(allFavoriteWifi, wifiPoints);
sendFavoriteLocationToServer(allFavoriteWeb, computerRooms);