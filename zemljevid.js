const ZAPADLOST = 1000 * 3600; // Kako stare avtobuse skrijemo (v milisekundah)

x = 46.051;
y = 14.505;
m2 = {}; // Markerji bodo zdaj kot key: value, kjer je key = vehicleId in value = marker
m3 = {}; //Marjerki za orientacijo


/* IKONE */
var busIcon = L.icon({
    iconUrl: 'bus.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30]
});
var busIconLpp = L.icon({
    iconUrl: 'lpp_bus.svg',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -26]
});
var busIconGood = L.icon({
    iconUrl: 'bus_good2.svg',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34]
}); 

var busIconKrsiDekret = L.icon({
    iconUrl: 'bus_krsiDekret.svg',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34]
}); 

var myIconlocation = L.icon({
    iconUrl: 'location_accent-01.svg',
	iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [-3, -76]
});

var busDirection = L.icon({
    iconUrl: 'bus_arrow.svg',
	iconSize: [45, 45],
    iconAnchor: [22.5, 37.5],
    popupAnchor: [0, -30]
});

/* ZEMLJEVID */
var mymap = L.map('mapid', {
    zoomControl: false
}).setView([x, y], 13);
L.maptilerLayer({
    apiKey: "Iz6oqHAlxuXztN4SolAF"
}).addTo(mymap);
L.tileLayer("", {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, data from <a href="https://ojpp.si">OJPP (CC BY 4.0)</a>',
    maxZoom: 18,
}).addTo(mymap);
/* L.control.attribution({
    position: 'topright'
}).addTo(mymap);
 */
/* LOKACIJA */
var radius, myLocation, myAccuracy;
mymap.locate({
    setView: false,
    maxZoom: 16,
    watch: true
});
function onLocationFound(e) {
    var radius = e.accuracy / 2;
    var color = '#3a4d39';
    if (!myLocation) {
        myLocation = L.marker(e.latlng, {
            icon: myIconlocation
        }).addTo(mymap);
        myAccuracy = L.circle(e.latlng, radius, {fillColor: color, color:color}).addTo(mymap);
        mymap.flyTo(e.latlng, 13)
    } else {
        animiraj(myLocation, e.latlng.lat, e.latlng.lng);
        animiraj(myAccuracy, e.latlng.lat, e.latlng.lng);
        myAccuracy.setRadius(radius);
    }
    xy = e.latlng;
}
mymap.on('locationfound', onLocationFound);
function onLocationError(e) {
    //alert(e.message);
}
mymap.on('locationerror', onLocationError);


/* REQUESTI */
/* ANIMACIJE */
animiraj = function(enMarker, newx, newy) {
    var p = 0; // potek interpolacije

    var x = enMarker.getLatLng().lat;
    var y = enMarker.getLatLng().lng;

    var pr = setInterval(function() {
        if (p < 1) {
            enMarker.setLatLng(new L.LatLng(cosp(x, newx, p), cosp(y, newy, p)));
            p += 0.1;
        } else {
            x = newx;
            y = newy;
            clearInterval(pr);
        }
    }, 0);
}

update_smer = function(enMarker, newx, newy, newbear) {
    var p = 0; // potek interpolacije

    var x = enMarker.getLatLng().lat;
    var y = enMarker.getLatLng().lng;
    var pr = setInterval(function() {
        if (p < 1) {
            enMarker.setLatLng(new L.LatLng(cosp(x, newx, p), cosp(y, newy, p)));
            p += 0.1;
            var oldTransform = enMarker._icon.style.transform;
            enMarker._icon.style.transform = `${oldTransform} rotate(${newbear}deg)`;
        } else {
            x = newx;
            y = newy;
            clearInterval(pr);
        }
    }, 0);
    
    
    console.log(enMarker._icon.style.transform);
}

rotirajPopup = function() {
    if (document.getElementsByClassName("leaflet-popup  leaflet-zoom-animated")[0].style.top == "50px") {
        document.getElementsByClassName("leaflet-popup-tip-container")[0].style.top = "";
        document.getElementsByClassName("leaflet-popup-tip-container")[0].style.transform = "";
        document.getElementsByClassName("leaflet-popup  leaflet-zoom-animated")[0].style.top = "";
    } else {
        document.getElementsByClassName("leaflet-popup-tip-container")[0].style.top = "-20px";
        document.getElementsByClassName("leaflet-popup-tip-container")[0].style.transform = "rotate(180deg)";
        document.getElementsByClassName("leaflet-popup  leaflet-zoom-animated")[0].style.top = "50px";
    }
}

/* CASOVNIK */
odstevalci = [];
function starost(tstamp, vid) {
	//console.log(tstamp, vid);
	let d = new Date();
	let output = "";
	let razmak = (d - new Date(tstamp));
	//console.log(razmak);
	
	if(razmak >= 1000*3600*24) {
		output += (Math.floor(razmak/1000/3600/24) + "d ");
		razmak %= (1000*3600*24);
	}

	if(razmak >= 1000*3600) {
		output += (Math.floor(razmak/1000/3600) + "h ");
		razmak %= (1000*3600);
	}

	if(razmak >= 1000*60) {
		output += (Math.floor(razmak/1000/60) + "min ");
		razmak %= (1000*60);
	}

	output += (Math.floor(razmak/1000) + "s");
	razmak %= (1000);

	document.getElementById("stamp_" + vid).innerText = output;
	return output;
}

odpriMaps = function(bus) {
    b = m2[bus].getLatLng();
    dest = eval(document.querySelector("input[name='cilj']:checked").value);
    window.open("https://www.google.com/maps/dir/?api=1&origin=" + b.lat + "%2C" + b.lng + "&destination=" + dest.lat + "%2C" + dest.lng + "&travelmode=driving");
}

brisiMarkerje = function() {
    for (const [key, value] of Object.entries(m2)) {
        mymap.removeLayer(m2[key]);
        delete m2[key];
    }
    for (const [key, value] of Object.entries(m3)) {
        mymap.removeLayer(m3[key]);
        delete m3[key];
    }
    busi = {};
}


function izrisi_OJPP(odg) {
	console.log("Risanje OJPP", busi);
    myIcon = busIcon;

	d = new Date(); // Uporabimo kasneje za skrivanje starih busov

    if(Object.keys(busi).length === 0) {
        //alert("Ni takih busov, vsaj ne na OJPP");
        //Get element with id 'non_existing'
        var errorPopup = document.getElementById("non_existing");

        //Increase opacity to 0.8 for 3 seconds with animation
        errorPopup.style.opacity = 0.8;
        errorPopup.style.transition = "opacity 1s ease-in-out";
        setTimeout(function(){errorPopup.style.opacity = 0;}, 3000);
        return;

    }
	
    for (const [busId, odg] of Object.entries(busi)) {
        var x = odg["lat"];
        var y = odg["long"];
        var vozilo = odg["vehicle_id"];
        var bear = odg["direction"];

        if(x === undefined || y === undefined) {
            // Bus nima koordinat, le izpišemo registrsko
            log.innerText += (`\n${vozilo}: ${odg["plate"]}, ${odg["route_name"]}, urnik: ${odg["time_departure"]}; model: ${odg?.["model"]?.["name"]}`);
            continue;
        }

        
        if (!m3[vozilo]) {
            m3[vozilo] = L.marker([x, y], {
                icon: busDirection,
            }).addTo(mymap);

            m3[vozilo]._icon.classList.add("rotated-marker");
            var oldTransform = m3[vozilo]._icon.style.transform;
            m3[vozilo]._icon.style.transform = `${oldTransform} rotate(${bear}deg)`;
            
        }
        if (!m2[vozilo]) {
            m2[vozilo] = L.marker([x, y], {
                icon: myIcon
            }).addTo(mymap);
        }
        

        // Tukaj preverimo, katere stare buse bomo skrili z mape.
        busTstamp = new Date(odg["time"]);
        
        if (!document.getElementById("prikazujStareBuse").checked && d - busTstamp > ZAPADLOST) {
            mymap.removeLayer(m2[vozilo]);
            delete m2[vozilo];
            continue;
        }
        // Konec preverjanja za skrivanje starih busov.

        if (odg["vehicle_id"] === null) {
			// Bus nima ID-ja, ignoriramo.
        } else {
            lng = y;
            lat = x;
            bear = odg["direction"];
            speed = odg?.["vehicleSpeed"] ?? `<span style="font-size: xx-small;">${odg?.["operator_name"]}</span>` ?? "🤷🏻‍♀️";
            vid = odg["vehicle_id"];


            content=""
            content +="<div class=''>"
            content += `<a href="https://ojpp.si/trips/${odg?.["trip_id"]}" target="_blank" class="popup_route">${odg?.["route_name"]}</a>`; //LINIJA
            content += ("<span class='popup_id' >Številka avtobusa: " + vid + "</span>"); //ID

            //Do not display if undefined
            timeDeparture = odg?.["time_departure"] ?? "";
            timeArrival = odg?.["prihodNaCilj"] ?? "";
            if (timeDeparture != "" || timeArrival != "") {
                content += `<br>Urnik za relacijo: ${timeDeparture}–${timeArrival}`; //ODO
                content += ("<br><b>" + odg["plate"] + "</b>"); //REGISTRSKA
            }



            content += (`<div class="popup_zamuda"><span class='popup_zamuda_button' onclick='izpisi_zamudo(this, \"${vid}\");'>Kolikšna je zamuda?</span><details class="zamudice"><summary>Zamuda</summary></details></div>`); //ZAMUDA
            content += "</div>"

            m2[vozilo].bindPopup(content);

            m2[vozilo]["busTstamp"] = busTstamp;
            m3[vozilo]["busTstamp"] = busTstamp;

            animiraj(m2[vozilo], lat, lng);
            update_smer(m3[vozilo], lat, lng, bear);
            outdejtajBus(vozilo);

        }



    }
	
}

function outdejtajBuse() {
    for(let m in m2) {
        outdejtajBus(m);
    }
    for(let m in m3) {
        outdejtajBus(m);
    }
}
function outdejtajBus(m) {
    let outdejtanost = clamp((((new Date()) - (new Date(m2[m]["busTstamp"])))/1000 - 90)/300, 0, 1); // New data arrives every 30 seconds, and is 60 seconds old. Fade out the marker slowly for 5 minutes.
    console.log(outdejtanost);
    m2[m]["_icon"]["style"]["filter"] = `grayscale(${lerp(0, 89, outdejtanost)}%) blur(${lerp(0, 0.07, outdejtanost)}rem) opacity(${lerp(100, 65, outdejtanost)}%)`
    //m2[m]["_icon"]["style"]["filter"] = `grayscale(${lerp(0, 100, outdejtanost)}%) opacity(${lerp(100, 65, outdejtanost)}%)`
}

let outdejtanje = setInterval(outdejtajBuse, 20000);