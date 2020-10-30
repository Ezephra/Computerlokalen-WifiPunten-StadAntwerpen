// Data filteren
// --------------------------------------------------------------
wifiPuntenBtn.addEventListener('click', () => {
    /* Als form wordt gesubmit of er wordt op icoon geklikt komen we ter hoogte van de hoofding
    * en wordt de filtering-container verborgen */
    $("#search-wifipunten").on('submit', e => {
        $('#filtering-container-wifipunten').addClass("hidden");
    })
    $(".fa-search").on('click', () => {
        $('#filtering-container-wifipunten').addClass("hidden");
    })
    // Map ontdoen van alle ongewenste layers
    mymap.eachLayer(layer => {
        mymap.removeLayer(layer);
    });
    mymap.addLayer(tileLayer);
    mymap.addLayer(layerFreeWifi);
    // Als er geklikt is op Wifipunten tonen we de wifipunten-zoekbar
    document.getElementById("search-wifipunten").classList.remove("hidden");
    document.getElementById("search-webpunten").classList.add("hidden");

    let checkboxLocatie = $('#locatieNaam');
    let checkboxGemeente = $('#gemeente');
    // 2 arrays declareren waarin de gefilterde locaties zullen komen
    let dataFilteredOnName = [];
    let dataFilteredOnRegion = [];
    // 2 layergroups om markers te tonen voor de gefilterde data
    let markersFilteredOnName = L.layerGroup();
    let markersFilteredOnRegion = L.layerGroup();

    $('.search-wifipunten').on('keyup', (e) => {
        // filtering-container tonen
        $('#filtering-container-wifipunten').removeClass('hidden');

        // bij elke toets worden de arrays gerefreshd
        dataFilteredOnName = new Array();
        dataFilteredOnRegion = new Array();
        let userInput = $(e.currentTarget).val().toLowerCase();

        // Als er geen input is verwijderen we de filtering-container en tonen we alle punten
        if (userInput === "") {
            $('.filtering-container').addClass('hidden');
            layerFreeWifi.addTo(mymap);
        }
        // Hier worden de arrays gevuld met de juiste locaties
        for (let i = 0; i < wifiPoints.length; i++) {
            // Filteren op locatie
            let locatie = wifiPoints[i].attributes.LOCATIE.toLowerCase();
            if (locatie.includes(userInput)) {
                // de corresponderende locaties in array stoppen
                dataFilteredOnName.push(wifiPoints[i]);
            }
            // Filteren op gemeente
            let locatieGemeente = wifiPoints[i].attributes.GEMEENTE.toLowerCase();
            if (locatieGemeente.includes(userInput)) {
                //corresponderende locaties in array stoppen
                dataFilteredOnRegion.push(wifiPoints[i]);
            }
        }
        // Het aantal tonen naast de checkboxes
        document.getElementById('locatie-counter').textContent = `(${dataFilteredOnName.length})`;
        document.getElementById('gemeente-counter').textContent = `(${dataFilteredOnRegion.length})`;

        // map ontdoen van andere layers
        mymap.removeLayer(layerComputerruimten);
        mymap.removeLayer(layerFreeWifi);
        // de gefilterde layerGroups telkens leeg maken van alle markers
        markersFilteredOnName.clearLayers();
        markersFilteredOnRegion.clearLayers();
        /* Als er tijdens het typen een checkbox is aangevinkt worden de juiste locaties getoond met deze functie */
        function showCorrectData(data, markers) {
            wifiAddLayer(data, markers);  // Functie "wifiAddLayer" geeft aan het gegeven layerGroup een layer van markers (dit a.d.h.v. meegegeven data)
            $('.filtered-data-container').empty(); // als er al elementen zijn eerst wegdoen
            addFilteredLocations(data); // dan elementen aanmaken
        }
        if (checkboxLocatie.is(':checked')) {
            showCorrectData(dataFilteredOnName, markersFilteredOnName);
        }
        if (checkboxGemeente.is(':checked')) {
            showCorrectData(dataFilteredOnRegion, markersFilteredOnRegion);
        }
        markersFilteredOnName.addTo(mymap);
        markersFilteredOnRegion.addTo(mymap);
    })
    /* Als er niet meer wordt getypt komen we hier, wanneer een checkbox wordt aangevinkt,
    * vinken we het andere af (radio-button-gedrag) en tonen we de correcte locaties */
    function showCorrectDataOnChange(checkbox, data, markersToShow, markersToRemove) {
        checkbox.prop('checked', false); // Deze checkbox uitvinken
        $('.filtered-data-container').empty();
        markersToRemove.clearLayers();
        wifiAddLayer(data, markersToShow); // Markers tonen
        addFilteredLocations(data); // Tonen in de container
    }
    // Als de checkboxes worden aangepast, correcte markers/locaties tonen
    checkboxLocatie.on('change', () => {
        if (checkboxLocatie.is(':checked')) {
            showCorrectDataOnChange(checkboxGemeente, dataFilteredOnName, markersFilteredOnName, markersFilteredOnRegion);
        }
    })
    checkboxGemeente.on('change', () => {
        if (checkboxGemeente.is(':checked')) {
            showCorrectDataOnChange(checkboxLocatie, dataFilteredOnRegion, markersFilteredOnRegion, markersFilteredOnName);
        }
    })
    /* Met deze functie tonen we de locaties in de container onder de zoekbalk */
    function addFilteredLocations(gefilterdeLocaties) {
        let $elParent = $('.filtered-data-container');
        let $locationDiv;
        for (let i = 0; i < gefilterdeLocaties.length; i++) {
            $locationDiv = $('<div></div>', { class: 'item-location' });

            $locationDiv.append('<h4></h4>');
            $locationDiv.append('<p></p>');

            $elParent.append($locationDiv);

            document.querySelectorAll('.item-location > h4')[i].textContent = gefilterdeLocaties[i].attributes.LOCATIE;
            document.querySelectorAll('.item-location > p')[i].textContent = gefilterdeLocaties[i].attributes.STRAAT;
        }
    }
});

computerRuimtenBtn.addEventListener('click', () => {
    // Als form wordt gesubmit of er wordt op icoon geklikt gaan we naar de hoofding en wordt de filtering-container verborgen
    $("#search-webpunten").on('submit', e => {
        $('#filtering-container-webpunten').addClass("hidden");
    })
    $(".fa-search").on('click', () => {
        $('#filtering-container-webpunten').addClass("hidden");
    })
    // Map ontdoen van alle layers, tileLayer toevoegen en alle webpunten tonen
    mymap.eachLayer(layer => {
        mymap.removeLayer(layer);
    });
    mymap.addLayer(tileLayer);
    mymap.addLayer(layerComputerruimten);
    // Als er geklikt is op Webpunten tonen we de webpunten-zoekbar
    document.getElementById("search-wifipunten").classList.add("hidden");
    document.getElementById("search-webpunten").classList.remove("hidden");

    let checkboxLocatie = $('#naam-webpunt');
    let checkboxGemeente = $('#gemeente-webpunt');
    let checkboxBegeleiding = $('#begeleiding');
    let checkboxGratis = $('#gratis');

    let dataFilteredOnName = [];
    let dataFilteredOnRegion = [];
    let dataFilteredOnGuidance = [];
    let dataFilteredOnPrize = [];

    // -- De array voor "gratis webpunten "en "webpunten met begeleiding" moeten niet gerefreshd worden, dus hier al vullen
    for (let i = 0; i < computerRooms.length; i++) {
        // Filteren op Prijs --> 17 gratis webpunten
        let prijs = computerRooms[i].attributes.KOSTPRIJS.toLowerCase();
        if (prijs === "gratis") {
            //corresponderende locaties in array stoppen
            dataFilteredOnPrize.push(computerRooms[i]);
        }
        // Filteren op Begeleiding --> 11 webpunten met begeleiding
        let begeleiding = computerRooms[i].attributes.BEGELEIDING.toLowerCase();
        if (begeleiding === "ja") {
            //corresponderende locaties in array stoppen
            dataFilteredOnGuidance.push(computerRooms[i]);
        }
    }

    let markersFilteredOnName = L.layerGroup();
    let markersFilteredOnRegion = L.layerGroup();
    let markersFilteredOnGuidance = L.layerGroup();
    let markersFilteredOnPrize = L.layerGroup();

    $('.search-webpunten').on('keyup', (e) => {
        // filtering-container tonen
        $('#filtering-container-webpunten').removeClass('hidden');

        // bij elke toets worden de arrays gerefreshd
        dataFilteredOnName = new Array();
        dataFilteredOnRegion = new Array();
        let userInput = $(e.currentTarget).val().toLowerCase();

        // Als er geen input is verwijderen we de filtering-container en tonen we alle webpunten
        if (userInput === "") {
            $('#filtering-container-webpunten').addClass('hidden');
            layerComputerruimten.addTo(mymap);
        }

        for (let i = 0; i < computerRooms.length; i++) {
            // Filteren op Naam
            let locatie = computerRooms[i].attributes.NAAM.toLowerCase();
            if (locatie.includes(userInput)) {
                // de corresponderende locaties in array stoppen
                dataFilteredOnName.push(computerRooms[i]);
            }
            // Filteren op Gemeente
            let gemeente = computerRooms[i].attributes.DISTRICT.toLowerCase();
            if (gemeente.includes(userInput)) {
                //corresponderende locaties in array stoppen
                dataFilteredOnRegion.push(computerRooms[i]);
            }
        }
        // Het aantal tonen naast de checkboxes
        document.getElementById('web-locatie-counter').textContent = `(${dataFilteredOnName.length})`;
        document.getElementById('web-gemeente-counter').textContent = `(${dataFilteredOnRegion.length})`;
        document.getElementById('begeleiding-counter').textContent = `(${dataFilteredOnGuidance.length})`;
        document.getElementById('gratis-counter').textContent = `(${dataFilteredOnPrize.length})`;

        // Map ontdoen van andere layers
        mymap.removeLayer(layerComputerruimten);
        mymap.removeLayer(layerFreeWifi);
        // De gefilterde layerGroups telkens leeg maken van alle markers
        [markersFilteredOnName, markersFilteredOnRegion, markersFilteredOnGuidance, markersFilteredOnPrize].forEach(markerLayer => {
            markerLayer.clearLayers();
        });

        /* Als er tijdens het typen een checkbox is aangevinkt worden de juiste locaties getoond met deze functie */
        function showCorrectData(data, markers) {
            ComputerAddLayer(data, markers);  // Functie "ComputerAddLayer" geeft aan het gegeven layerGroup een layer van markers (dit a.d.h.v. meegegeven data)
            $('.filtered-webpunten-container').empty(); // als er al elementen zijn eerst wegdoen
            addFilteredLocations(data); // dan elementen aanmaken
        }
        if (checkboxLocatie.is(':checked')) {
            showCorrectData(dataFilteredOnName, markersFilteredOnName);
        }
        if (checkboxGemeente.is(':checked')) {
            showCorrectData(dataFilteredOnRegion, markersFilteredOnRegion);
        }
        if (checkboxBegeleiding.is(':checked')) {
            showCorrectData(dataFilteredOnGuidance, markersFilteredOnGuidance);
        }
        if (checkboxGratis.is(':checked')) {
            showCorrectData(dataFilteredOnPrize, markersFilteredOnPrize);
        }
        // De LayerGroups toevoegen aan de map
        [markersFilteredOnName, markersFilteredOnRegion, markersFilteredOnGuidance, markersFilteredOnPrize].forEach(markerLayer => {
            markerLayer.addTo(mymap);
        });
    });
    /* Als er niet meer wordt getypt komen we hier, wanneer een checkbox wordt aangevinkt,
    * vinken we het andere af (radio-button-gedrag) en tonen we de correcte locaties */
    function showCorrectDataOnChange(checkboxes, markersToRemove, data, markersToShow) {
        checkboxes.forEach(box => box.prop('checked', false)); // Alle andere checkboxen uitvinken
        $('.filtered-webpunten-container').empty();
        markersToRemove.forEach(layer => layer.clearLayers());
        ComputerAddLayer(data, markersToShow); // Markers tonen
        addFilteredLocations(data); // Tonen in de container
    }
    checkboxLocatie.on('change', () => {
        if (checkboxLocatie.is(':checked')) {
            let checkboxen = [checkboxGemeente, checkboxBegeleiding, checkboxGratis];
            let markers = [markersFilteredOnRegion, markersFilteredOnGuidance, markersFilteredOnPrize];
            showCorrectDataOnChange(checkboxen, markers, dataFilteredOnName, markersFilteredOnName);
        }
    })
    checkboxGemeente.on('change', () => {
        if (checkboxGemeente.is(':checked')) {
            let checkboxen = [checkboxLocatie, checkboxBegeleiding, checkboxGratis];
            let markers = [markersFilteredOnName, markersFilteredOnGuidance, markersFilteredOnPrize];
            showCorrectDataOnChange(checkboxen, markers, dataFilteredOnRegion, markersFilteredOnRegion);
        }
    })
    checkboxBegeleiding.on('change', () => {
        if (checkboxBegeleiding.is(':checked')) {
            let checkboxen = [checkboxGemeente, checkboxLocatie, checkboxGratis];
            let markers = [markersFilteredOnRegion, markersFilteredOnName, markersFilteredOnPrize];
            showCorrectDataOnChange(checkboxen, markers, dataFilteredOnGuidance, markersFilteredOnGuidance);
        }
    })
    checkboxGratis.on('change', () => {
        if (checkboxGratis.is(':checked')) {
            let checkboxen = [checkboxGemeente, checkboxBegeleiding, checkboxLocatie];
            let markers = [markersFilteredOnRegion, markersFilteredOnGuidance, markersFilteredOnName];
            showCorrectDataOnChange(checkboxen, markers, dataFilteredOnPrize, markersFilteredOnPrize);
        }
    })
    function addFilteredLocations(gefilterdeLocaties) {
        let $elParent = $('.filtered-webpunten-container');
        let $locationDiv;
        for (let i = 0; i < gefilterdeLocaties.length; i++) {

            $locationDiv = $('<div></div>', { class: 'webpunt-location' });

            $locationDiv.append('<h4></h4>');
            $locationDiv.append('<p class="first-paragraph"></p>');
            $locationDiv.append('<p class="second-paragraph"></p>');
            $locationDiv.append('<p class="third-paragraph"></p>');

            $elParent.append($locationDiv);

            document.querySelectorAll('.webpunt-location > h4')[i].textContent = gefilterdeLocaties[i].attributes.NAAM;
            document.querySelectorAll('.webpunt-location > .first-paragraph')[i].textContent = gefilterdeLocaties[i].attributes.STRAATNAAM;
            document.querySelectorAll('.webpunt-location > .second-paragraph')[i].textContent = `Begeleiding: ${gefilterdeLocaties[i].attributes.BEGELEIDING}`;
            document.querySelectorAll('.webpunt-location > .third-paragraph')[i].textContent = `Kostprijs: ${gefilterdeLocaties[i].attributes.KOSTPRIJS}`;
        }
    }
})