(function(){

    //create map in leaflet and tie it to the div called 'theMap'
    let map = L.map('theMap').setView([44.650627, -63.597140], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let largeIcon = L.icon({
        iconUrl: 'busPurple.png',
        iconSize: [36]
    });

    let smallIcon = L.icon({
        iconUrl: 'busPurple.png',
        iconSize: [18]
    });
    
    //Format and convert JSON to GeoJSON for map
    const transformData = (myJson) => {
        return myJson.map((bus) => {
            let buses = {
                type: "Point",
                routeNum: bus.vehicle.trip.routeId,           
                coordinates: [bus.vehicle.position.longitude, bus.vehicle.position.latitude],
                bearing: bus.vehicle.position.bearing
            };
           
            return buses;
        });
    };

    //Layer for bus points so map can be updated
    let busLayer = L.layerGroup().addTo(map);


    //Change JS objects to GeoJSON data
    const displayBuses = function() {
        fetch("https://hrmbuses.azurewebsites.net")
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                // filter json for bus routes 1-10
                let routeFilter = myJson.entity.filter(entity => parseInt(entity.vehicle.trip.routeId) <= 14);
                //Clear old markers from layerGroup
                busLayer.clearLayers();

                L.geoJSON(transformData(routeFilter), {
                    onEachFeature: function (feature) {
                        //Icon based on zoom
                        let busIcon = map.getZoom() > 14 ? largeIcon : smallIcon;              
                        let marker = L.marker([feature.coordinates[1], feature.coordinates[0]], { icon: busIcon, rotationAngle: feature.bearing }
                            ).bindPopup(
                                `Bus Route: ${feature.routeNum}`
                            ).addTo(busLayer);

                        // change icon size based on zoom
                        map.on('zoomend', function () {
                            if (map.getZoom() >= 14) {
                                marker.setIcon(largeIcon);
                            }
                            else {
                                marker.setIcon(smallIcon);
                            }
                        });
                    }
                });

            });
        setTimeout(displayBuses, 10000);
    };
    displayBuses();

})();