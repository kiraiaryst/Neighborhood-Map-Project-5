//Array of locations information
var locations = [{
        name: "Toka18",
        lat: 50.461134,
        lng: 30.464791,
        title: "Restaurant Ronin",
        forWiki: "Lukyanivka_(neighborhood)",
        address: "Zoologichna vul. 10",
        phone: "38(044)338-33-23"
    },

    {
        name: "OKKO station",
        lat: 50.480396,
        lng: 30.490633,
        title: "OKKO",
        forWiki: "OKKO",
        address: "Novokostyantynivska vul. 4a",
        phone: "380(93)741-00-00"
    },

    {
        name: "Obolon residences",
        lat: 50.5146468,
        lng: 30.4946931,
        title: "Obolon",
        forWiki: "Obolonskyi_District",
        address: "Obolonsky prosp. 26",
        phone: "38(044)227-45-21"

    },

    {
        name: "Ecottage",
        lat: 50.450888,
        lng: 30.590454,
        title: "E-line",
        forWiki: "Livoberezhnyi_neighborhood, Kiev",
        address: "Brovarsky prosp. 15",
        phone: "38(044)201-11-61"

    }, {
        name: "Toka5",
        lat: 50.511032,
        lng: 30.5540664,
        title: "Toka EV Plug",
        forWiki: "Troieshchyna",
        address: "Saburova 2a, Kiev",
        phone: "38(044)338-33-23"

    }, {
        name: "Z.E. mobiles",
        lat: 50.588375,
        lng: 30.495155,
        title: "Mennekes (Type 2)",
        forWiki: "Vyshhorod",
        address: "Mezhigorskogo Spasa, 2, Vyshhorod",
        phone: "38(093)220-05-05"
    }
];

//Made some of the variables global
var map;
var infowindow;
var marker;

//Setting Knockout observables for data
var Station = function(data) {
    this.name = ko.observable(data.name);
    this.title = ko.observable(data.title);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.forWiki = ko.observable(data.forWiki);
    this.address = ko.observable(data.address);
    this.phone = ko.observable(data.phone);
    this.LatLng = ko.computed(function() {
        return this.lat() + "," + this.lng();
    }, this);
};

//Start of the View Model
function viewModel() {
    var myLatLng = {
        lat: 50.449053,
        lng: 30.5130017
    };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: myLatLng
    });
    //Created map centered on Kiev, Ukraine

    var i;

    infowindow = new google.maps.InfoWindow();

    var self = this;
    //Created a variable to keep references of "this" inside the View Model

    var stations = ko.utils.arrayMap(locations, function(location) {
        return new Station(location);
    });
    this.stationList = ko.observableArray(stations);
    this.filter = ko.observable("");

    //   Function to bind to list for marker action.
    self.select = function(loc) {
        infowindow.open(map, loc.marker);
        console.log(infowindow.setContent);
    };

    //List and marker filter function
    this.filteredItems = ko.computed(function() {
        var listFilter = self.filter().toLowerCase();
        return ko.utils.arrayFilter(self.stationList(), function(item) {
            //console.log(item);
            if (item.name().toLowerCase().indexOf(listFilter) > -1) {
                if (item.marker) item.marker.setVisible(true);
                return true;
            } else {
                item.marker.setVisible(false);
                return false;
            }
        });
    }, self);

    //For each function to  iterate through locations.
    this.stationList().forEach(function(station) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(station.lat(), station.lng()),
            map: map
        });
        station.marker = marker;

        marker.name = station.name;

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, this);
            self.select(station);
            Wiki(station);
            toggleBounce(marker);
        });

        station.marker.addListener('click', toggleBounce);


        //Animation for markers after loaded on the map. Click will animate the markers for 1000ms.
        function toggleBounce() {
            if (station.marker.getAnimation() !== null) {
                station.marker.setAnimation(null);
            } else {
                station.marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    station.marker.setAnimation(null);
                }, 1000);
            }
        };

        // Set up variables to access Wikipedia data.
        function Wiki(station) {
            var locName = station.forWiki();
            var addresses = station.address();
            var phones = station.phone();
            var names = station.name();
            var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + locName + '&limit=1&format=json&callback=wikiCallback';
            var wikiRequestTimeout = setTimeout(function() {
                alert("Unfortunately, Wikipedia is unavailable. Please try again later.");
            }, 5000); // Error handler if wikipedia data can't be obtained


            //AJAX request for Wikipedia API information used in infowindows
            $.ajax({
                url: wikiUrl,
                dataType: "jsonp",
                jsonp: "callback",
                success: function(response) {
                    var wikiList = response[1];
                    for (var i = 0; i < wikiList.length; i++) {
                        wikiData = wikiList[i];
                        var url = 'http://en.wikipedia.org/wiki/' + wikiData;
                        infowindow.setContent('<p>' + names + '</p>' + '<p>' + phones + '</p>' + '<h6>Wikipedia</h6>' + '<h6><a href="' + url + '">' + url + '</a></h6>' + '<p>' + response[2] + '</p>' + '<p>' + addresses + '</p>');
                    }
                    clearTimeout(wikiRequestTimeout);
                }
            });
        };
        Wiki(station);
    });

};
function loadError() {
        alert("Sorry, Google map failed to load...");
    };
    
//Application callback
function startApp() {
    ko.applyBindings(new viewModel());
};
