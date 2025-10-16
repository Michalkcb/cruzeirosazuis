var geocoder;
var map;
var dymek = new google.maps.InfoWindow({maxWidth:'250'});

// wspólne cechy ikon
var rozmiar = new google.maps.Size(24, 30);
var rozmiar_cien = new google.maps.Size(12, 8);
var punkt_startowy = new google.maps.Point(0, 0);
var punkt_zaczepienia = new google.maps.Point(16, 16);

function initialize(){
   geocoder = new google.maps.Geocoder();
   var myOptions = {
        zoom: 8,
        //mapTypeId: google.maps.MapTypeId.ROADMAP,
       mapTypeId: google.maps.MapTypeId.TERRAIN,
       mapTypeControl: true
   }
 map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
				
}



function showGPS(gpse, gpsn, txt){
    var wspolrzedne = new google.maps.LatLng(gpse, gpsn);
    map.setCenter(wspolrzedne);
    ikona = new google.maps.MarkerImage("../images/sail.png", rozmiar, punkt_startowy, punkt_zaczepienia); 
    var marker = new google.maps.Marker({
        map: map,
        icon: ikona,
        position: wspolrzedne
    });
    
    google.maps.event.addListener(marker, "click", function(){
        //dymek.setContent(txt);
        //dymek.open(map, marker);
    });
    
    google.maps.event.trigger(marker, 'click');
    
}

function showGPS2(gpse, gpsn, txt){
    var wspolrzedne = new google.maps.LatLng(gpse, gpsn);
    var marker = new google.maps.Marker({
        map: map,
		icon: 'flag12z.png',
        position: wspolrzedne,
		
    });
    
    google.maps.event.addListener(marker, "mouseover", function(){
		dymek.setContent(txt);
        dymek.open(map, marker);
    });
    
	google.maps.event.addListener(marker, "mouseout", function(){
        //dymek.setContent(txt);
        dymek.close();
    });
}

// ta funkcja generuje zawartość okienka informacyjnego
//function zawartoscOkna(tytul, opis){
//    return '<h3>' + tytul + '</h3><p>' + opis + '</p>';
//}
