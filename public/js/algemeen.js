// FUNCTIES DIE DOOR MEERDERE PAGINA'S WORDEN GEBRUIKT (om herhaling te vermijden)
/* Doormiddel van deze functies kunnen we markers tonen op de map, ze vullen een gegeven layergroup met markers voor
 * de locaties die zijn meegegeven als argument (json) */
function wifiAddLayer(data, layerGroup) {
    // Voor elke coordinaat een marker maken
    data.forEach(feature => {
        // Het eerste getal was y niet x...
        let firstNum = feature.geometry.y;
        let secondNum = feature.geometry.x;

        // De data nodig voor de popup:
        let locatie = feature.attributes.LOCATIE;
        let straat = feature.attributes.STRAAT;
        let huisnr = feature.attributes.HUISNR;
        let postcode = feature.attributes.POSTCODE;
        let gemeente = feature.attributes.GEMEENTE;
        let wifi_icon = L.icon({
            iconUrl: "images/wifi_icon.png",
            iconSize: [40, 40],
            popupAnchor: [0, -15]
        });
        let popupInfo = `<b><u>${locatie}</u></b><br><span>${straat} ${huisnr}, ${postcode} ${gemeente}</span>`;
        let popupOptions = {
            className: "custom"
        };

        let marker = L.marker([firstNum, secondNum], {
            icon: wifi_icon
        }).bindPopup(popupInfo, popupOptions);
        layerGroup.addLayer(marker);
    });
}
function ComputerAddLayer(data, layerGroup) {
    // Nu voor elke coordinaat een marker maken
    data.forEach(feature => {
        // Het eerste getal was y niet x...
        let firstNum = feature.geometry.y;
        let secondNum = feature.geometry.x;

        // De data nodig voor de popup:
        let locatie = feature.attributes.NAAM;
        let straat = feature.attributes.STRAATNAAM;
        let huisnr = feature.attributes.HUISNUMMER;
        let postcode = feature.attributes.POSTCODE;
        let gemeente = feature.attributes.DISTRICT;
        let computerroom_icon = L.icon({
            iconUrl: "images/roomMarker.png",
            iconSize: [40, 40],
            popupAnchor: [0, -15]
        });
        let popupInfo = `<b><u>${locatie}</u></b><br><span>${straat} ${huisnr}, ${postcode} ${gemeente}</span>`;
        let popupOptions = {
            className: "custom"
        };

        let marker = L.marker([firstNum, secondNum], {
            icon: computerroom_icon
        }).bindPopup(popupInfo, popupOptions);
        layerGroup.addLayer(marker);
    });
}

/* Deze functie maakt het mogelijk om in te zoomen op een marker wanneer de corresponderende locatie geklikt wordt (in de lijst) */
function ZoomIn(data, map) {
    let adressen = document.querySelectorAll(".adres");
    adressen.forEach(address => {
        address.addEventListener('click', e => {
            let geklikteAdres = e.currentTarget.innerText;
            let eenAdres;
            for (let i = 0; i < data.length; i++) {
                if (data[i].attributes.STRAAT !== undefined) {
                    eenAdres = `${data[i].attributes.STRAAT} ${data[i].attributes.HUISNR}, ${data[i].attributes.POSTCODE} ${data[i].attributes.GEMEENTE}`;
                } else {
                    eenAdres = `${data[i].attributes.STRAATNAAM} ${data[i].attributes.HUISNUMMER}, ${data[i].attributes.POSTCODE} ${data[i].attributes.DISTRICT}`;
                }
                // inzoomen op de juiste marker
                if (eenAdres == geklikteAdres) {
                    let coordinates = data[i].geometry;
                    map.setView([coordinates.y, coordinates.x], 16);
                }
            }
        })
    })
}

/* 2 functies die gebruikt worden om de zijmenu te openen en sluiten */
function openNav() {
    let sideMenu = document.getElementById("mySidenav");
    sideMenu.classList.remove("closedMenu");
    sideMenu.classList.add("openMenu");
}
function closeNav() {
    let sideMenu = document.getElementById("mySidenav");
    sideMenu.classList.remove("openMenu");
    sideMenu.classList.add("closedMenu");
}

/* Met deze functie wordt de details-container in de lijst geopend en gesloten */
function openCloseDetails(el) {
    let parent = $(el).parent().get(0);
    let details = parent.nextElementSibling;
    let arrow = el.querySelectorAll(".detailsArrow")[0];
    let hidden = details.classList.contains("hidden");
    if (hidden) {
        details.classList.remove("hidden");
        arrow.classList.remove("fa-chevron-down");
        arrow.classList.add("fa-chevron-up");
    } else {
        details.classList.add("hidden");
        arrow.classList.add("fa-chevron-down");
        arrow.classList.remove("fa-chevron-up");
    }
}