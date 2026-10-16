// Edit this file to add destinations. Coordinates use [latitude, longitude].
// description: null omits the description; a nonempty string displays it.
// Numbers are generated: Station 96 first, then Woodlawn A–Z, then Lincoln Heights A–Z.
// Add records without a number; IDs keep routes stable when names or numbering change.
// entrances optionally provides separately routable accesses. Run scripts/build-local-routes.mjs after changing coordinates.
export const stationId="woodlawn-fd";
const destinationRecords=[
  {
    "id": "woodlawn-fd",
    "name": "Woodlawn Fire Department",
    "area": "woodlawn",
    "address": "10121 Springfield Pike",
    "source": "https://www.beautifulwoodlawn.us/fire-division/",
    "description": null,
    "ll": [
      39.250938,
      -84.470879
    ]
  },
  {
    "id": "lincoln-fd",
    "name": "Lincoln Heights Firehouse",
    "area": "lincoln",
    "address": "1201 Steffen Avenue",
    "source": "https://www.vlho.org/departments/fire_department.php",
    "description": null,
    "ll": [
      39.239099,
      -84.45483
    ]
  },
  {
    "id": "woodlawn-pd",
    "name": "Woodlawn Police Department",
    "area": "woodlawn",
    "address": "10143 Woodlawn Boulevard",
    "source": "https://www.discoverpolicing.org/agency/woodlawn-police-department/",
    "description": null,
    "ll": [
      39.251377,
      -84.475294
    ]
  },
  {
    "id": "recreation",
    "name": "Woodlawn Recreation Center",
    "area": "woodlawn",
    "address": "10050 Woodlawn Boulevard",
    "source": "https://woodlawn.recdesk.com/Community/Facility/Detail?facilityId=1",
    "description": null,
    "ll": [
      39.250347,
      -84.473467
    ]
  },
  {
    "id": "friendship",
    "name": "Friendship Plaza Apartments",
    "area": "lincoln",
    "address": "901 Congress Avenue",
    "source": "https://www.unitedchurchhomes.org/wp-content/uploads/2023-Friendship-Plaza-TSP-PRAC-Updated.pdf",
    "description": null,
    "ll": [
      39.247665,
      -84.458733
    ]
  },
  {
    "id": "glendale-care",
    "name": "Glendale Place Nursing & Rehab",
    "area": "woodlawn",
    "address": "779 Glendale Milford Road",
    "source": "https://caringplacehcg.com/glendale-place-nursing-rehab/",
    "description": null,
    "ll": [
      39.25514,
      -84.459649
    ]
  },
  {
    "id": "commons",
    "name": "The Commons Apartments",
    "area": "woodlawn",
    "address": "10645 Springfield Pike",
    "source": "https://www.rentthecommons.com/Site-map.aspx",
    "description": null,
    "ll": [
      39.263638,
      -84.473452
    ]
  },
  {
    "id": "pike2",
    "name": "Pike 2 Bar & Grill",
    "area": "woodlawn",
    "address": "10010 Springfield Pike",
    "source": "https://thevoiceofblackcincinnati.com/black-owned-business/pike-2-bar-and-grill/",
    "description": null,
    "ll": [
      39.247664,
      -84.470408
    ]
  },
  {
    "id": "kroger-store",
    "name": "Kroger Store",
    "area": "woodlawn",
    "address": "10595 Springfield Pike",
    "source": "https://www.kroger.com/stores/grocery/oh/cincinnati/woodlawn/014/00433",
    "description": null,
    "ll": [
      39.260001,
      -84.471051
    ]
  },
  {
    "id": "century-inn",
    "name": "Century Inn",
    "area": "woodlawn",
    "address": "10675 Springfield Pike",
    "source": "https://www.thecenturyinn.com/",
    "description": null,
    "ll": [
      39.264875,
      -84.469637
    ]
  },
  {
    "id": "century-lake",
    "name": "Century Lake Apartments",
    "area": "woodlawn",
    "address": "51 Bishopsgate Drive",
    "source": "https://www.morgan-properties.com/apartments/oh/cincinnati/century-lake/contact-us",
    "description": null,
    "ll": [
      39.265961,
      -84.473126
    ]
  },
  {
    "id": "trillium",
    "name": "Trillium Trails Wildflower Preserve",
    "area": "woodlawn",
    "address": "West of Springfield Pike · no verified street entrance",
    "ll": [
      39.255716,
      -84.481092
    ],
    "routeUnavailable": "No established vehicle approach is confirmed. Previous access required off-road travel; this pin marks the preserve, not a drivable entrance.",
    "source": "https://www.greatparks.org/parks/glenwood-gardens",
    "description": null
  },
  {
    "id": "national-guard",
    "name": "National Guard / Woodlawn Armory",
    "area": "woodlawn",
    "address": "10050 Woodlawn Boulevard",
    "source": "https://nationalguard.com/ohio",
    "description": null,
    "ll": [
      39.249061,
      -84.472474
    ]
  },
  {
    "id": "kroger-warehouse",
    "name": "Kroger Warehouse",
    "area": "woodlawn",
    "address": "98 Glendale Milford Road",
    "source": "https://www.thekrogerco.com/vendor-suppliers/logistics/",
    "description": null,
    "ll": [
      39.258697,
      -84.468421
    ]
  },
  {
    "id": "transport",
    "name": "Woodlawn Transport Division",
    "area": "woodlawn",
    "address": "10088 Springfield Pike Ste 5",
    "source": null,
    "description": null,
    "ll": [
      39.249527,
      -84.46993
    ]
  },
  {
    "id": "villas",
    "name": "Villas of the Valley / Villas Circle",
    "area": "lincoln",
    "address": "740 Villas Circle",
    "source": "https://www.poah.org/property/ohio/villas-valley-i",
    "description": null,
    "ll": [
      39.243409,
      -84.460161
    ]
  },
  {
    "id": "health-center",
    "name": "Lincoln Heights Health Center",
    "area": "lincoln",
    "address": "1401 Steffen Avenue",
    "source": "https://www.healthcare-connection.org/about",
    "description": null,
    "ll": [
      39.238813,
      -84.452639
    ]
  },
  {
    "id": "dorothy",
    "name": "White Cliff / Dorothy Court",
    "area": "lincoln",
    "address": "6 Dorothy Court",
    "source": "https://housingapartments.org/rental_detail/15632",
    "description": null,
    "ll": [
      39.243825,
      -84.452902
    ],
    "aliases": [
      "White Cliff",
      "White Cliff Apartments",
      "Dorothy Court elderly block"
    ],
    "requestNumbers": [
      18,
      22
    ]
  },
  {
    "id": "big-a",
    "name": "The Big A",
    "area": "lincoln",
    "address": "793 Chamberlain Avenue",
    "source": null,
    "description": null,
    "ll": [
      39.240881,
      -84.460515
    ]
  },
  {
    "id": "goodwill",
    "name": "Goodwill",
    "area": "woodlawn",
    "address": "10600 Springfield Pike",
    "source": "https://www.cincinnatigoodwill.org/resource-fair/",
    "description": null,
    "ll": [
      39.263534,
      -84.467473
    ],
    "entrances": [
      {
        "id": "main",
        "label": "Springfield Pike campus",
        "address": "10600 Springfield Pike",
        "ll": [
          39.263534,
          -84.467473
        ]
      },
      {
        "id": "outlet",
        "label": "Glendale Road outlet / pickup",
        "address": "10633 Glendale Road",
        "ll": [
          39.263338,
          -84.464034
        ],
        "source": "https://shopgoodwill.com/Oh"
      }
    ]
  },
  {
    "id": "lincoln-school",
    "name": "Lincoln Heights Elementary",
    "area": "lincoln",
    "address": "1113 Adams Street",
    "source": "https://www.princetonschools.net/o/lincoln/article/2140086",
    "description": null,
    "ll": [
      39.243887,
      -84.456224
    ]
  },
  {
    "id": "shivers-court",
    "name": "Shivers Court",
    "area": "lincoln",
    "address": "Shivers Court off Wabash Avenue / Mangham Drive",
    "ll": [
      39.249089,
      -84.447981
    ],
    "source": null,
    "description": null,
    "localCorrection": true
  },
  {
    "id": "able-court",
    "name": "Able Court",
    "area": "lincoln",
    "address": "Able Court off Wabash Avenue / Mangham Drive",
    "ll": [
      39.24914,
      -84.448695
    ],
    "source": null,
    "description": null,
    "localCorrection": true
  },
  {
    "id": "love-court",
    "name": "Love Court",
    "area": "lincoln",
    "address": "Love Court off Wabash Avenue / Mangham Drive",
    "ll": [
      39.249218,
      -84.449393
    ],
    "source": null,
    "description": null,
    "localCorrection": true
  },
  {
    "id": "hunter-court",
    "name": "Hunter Court",
    "area": "lincoln",
    "address": "Hunter Court off Wabash Avenue / Mangham Drive",
    "ll": [
      39.249129,
      -84.45011
    ],
    "source": null,
    "description": null,
    "localCorrection": true
  },
  {
    "id": "oak-park",
    "name": "Oak Park Apartments",
    "area": "lincoln",
    "address": "1411 Wabash Avenue",
    "source": "https://oakpark.nelsonasc.com/contact/",
    "description": null,
    "ll": [
      39.248725,
      -84.451056
    ]
  },
  {
    "id": "sunoco",
    "name": "Sunoco Gas Station",
    "area": "woodlawn",
    "address": "1545 Glendale Milford Road",
    "source": "https://www.sunoco.com/locations/store/1545-glendale-milford-rd-cincinnati-oh-0680653300",
    "description": null,
    "ll": [
      39.255884,
      -84.449044
    ],
    "areaNote": "Nearby · Evendale edge"
  },
  {
    "id": "idea",
    "name": "IDEA Valley View",
    "area": "woodlawn",
    "address": "1011 Glendale Milford Road",
    "source": "https://ideapublicschools.org/our-schools/idea-valley-view/",
    "description": null,
    "ll": [
      39.255928,
      -84.456978
    ]
  },
  {
    "id": "major-tire",
    "name": "Major Tire",
    "area": "woodlawn",
    "address": "518 Glendale Milford Road",
    "source": "https://www.majortire.com/",
    "description": null,
    "ll": [
      39.257955,
      -84.462768
    ]
  },
  {
    "id": "woodlawn-school",
    "name": "Woodlawn Elementary",
    "area": "woodlawn",
    "address": "31 Riddle Road",
    "source": "https://www.princetonschools.net/o/woodlawn",
    "description": null,
    "ll": [
      39.252991,
      -84.472772
    ]
  }
];
// Recalculate from the full catalog before filtering/search so numbers stay consistent everywhere.
export function numberDestinations(records){
  const areas={woodlawn:0,lincoln:1};
  const alphabet=new Intl.Collator('en',{sensitivity:'base',numeric:true});
  return [...records].sort((a,b)=>{
    if(a.id===stationId)return -1;
    if(b.id===stationId)return 1;
    return (areas[a.area]??2)-(areas[b.area]??2)||alphabet.compare(a.name,b.name)||alphabet.compare(a.id,b.id);
  }).map((d,index)=>({...d,number:index+1}));
}
export const destinations=numberDestinations(destinationRecords);
