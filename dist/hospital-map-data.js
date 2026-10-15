// Campus coordinates: OpenStreetMap / Mapcarta, checked 2026-10-15.
// Pins locate campuses, not ambulance entrances. Keep this list aligned with hospitals.js.
export const hospitalPlaces = [
 {id:'fairfield',label:'Mercy Fairfield',ll:[39.31329,-84.51710],direction:'NW',address:'3000 Mack Road',source:'https://mapcarta.com/21381872'},
 {id:'bethesda',label:'Bethesda North',ll:[39.25140,-84.34037],direction:'E',address:'10500 Montgomery Road',source:'https://www.latlong.net/poi/bethesda-north-hospital-3505'},
 {id:'ucmc',label:'UCMC',ll:[39.13782,-84.50312],direction:'S',address:'3188 Bellevue Avenue',source:'https://mapcarta.com/26834074',offset:[30,5]},
 {id:'westchester',label:'UC West Chester',ll:[39.35952,-84.36716],direction:'NE',address:'7700 University Drive',source:'https://mapcarta.com/W98388688',offset:[15,9]},
 {id:'samaritan',label:'Good Samaritan',ll:[39.13897,-84.52185],direction:'S',address:'375 Dixmyth Avenue',source:'https://mapcarta.com/21371442',offset:[-26,0]},
 {id:'christ',label:'Christ · Mt. Auburn',ll:[39.12083,-84.51110],direction:'S',address:'2139 Auburn Avenue',source:'https://mapcarta.com/21362728',offset:[0,24]},
 {id:'jewish',label:'Mercy Jewish',ll:[39.20693,-84.38176],direction:'SE',address:'4777 East Galbraith Road',source:'https://www.latlong.net/poi/the-jewish-hospital-1908'},
 {id:'childrens-main',label:'Children’s · Burnet',ll:[39.14083,-84.50332],direction:'S',address:'3333 Burnet Avenue',source:'https://mapcarta.com/26834076',pediatric:true,offset:[15,-27]},
 {id:'childrens-liberty',label:'Children’s · Liberty',ll:[39.37585,-84.36812],direction:'NE',address:'7777 Yankee Road',source:'https://mapcarta.com/W206519313',pediatric:true,offset:[-15,-10]}
];
