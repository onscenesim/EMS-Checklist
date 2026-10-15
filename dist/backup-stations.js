// Official addresses checked and geocoded with Esri on 2026-10-15.
export const corridorStations=[
  {
    "id": "cfd2",
    "name": "Cincinnati 2",
    "address": "18 E Seymour Avenue, Cincinnati, OH",
    "source": "https://www.cincinnatifirefighters.org/about/fire-stations",
    "ll": [
      39.194257,
      -84.478876
    ]
  },
  {
    "id": "cfd38",
    "name": "Cincinnati 38",
    "address": "723 Circle Avenue, Cincinnati, OH",
    "source": "https://www.cincinnatifirefighters.org/about/fire-stations",
    "ll": [
      39.169617,
      -84.517626
    ]
  },
  {
    "id": "cfd12",
    "name": "Cincinnati 12",
    "address": "3001 Spring Grove Avenue, Cincinnati, OH",
    "source": "https://www.cincinnatifirefighters.org/about/fire-stations",
    "ll": [
      39.13587,
      -84.541191
    ]
  },
  {
    "id": "cfd19",
    "name": "Cincinnati 19",
    "address": "2814 Short Vine Street, Cincinnati, OH",
    "source": "https://www.cincinnatifirefighters.org/about/fire-stations",
    "ll": [
      39.132208,
      -84.50883
    ]
  },
  {
    "id": "cfd32",
    "name": "Cincinnati 32",
    "address": "650 Forest Avenue, Cincinnati, OH",
    "source": "https://www.cincinnatifirefighters.org/about/fire-stations",
    "ll": [
      39.14598,
      -84.492764
    ]
  },
  {
    "id": "cfd34",
    "name": "Cincinnati 34",
    "address": "301 Ludlow Avenue, Cincinnati, OH",
    "source": "https://www.cincinnatifirefighters.org/about/fire-stations",
    "ll": [
      39.143333,
      -84.519446
    ]
  },
  {
    "id": "cfd5",
    "name": "Cincinnati 5",
    "address": "6 E McMicken Avenue, Cincinnati, OH",
    "source": "https://www.cincinnatifirefighters.org/about/fire-stations",
    "ll": [
      39.116737,
      -84.516638
    ]
  },
  {
    "id": "wc73",
    "name": "West Chester 73",
    "address": "4850 Duff Drive, West Chester, OH",
    "source": "https://www.westchesteroh.org/government/fire/contact-fire-ems/fire-stations",
    "ll": [
      39.31041,
      -84.46271
    ]
  },
  {
    "id": "wc71",
    "name": "West Chester 71",
    "address": "9119 Cincinnati Dayton Road, West Chester, OH",
    "source": "https://www.westchesteroh.org/government/fire/contact-fire-ems/fire-stations",
    "ll": [
      39.32398,
      -84.411176
    ]
  },
  {
    "id": "wc75",
    "name": "West Chester 75",
    "address": "7588 Tylers Place Boulevard, West Chester, OH",
    "source": "https://www.westchesteroh.org/government/fire/contact-fire-ems/fire-stations",
    "ll": [
      39.35818,
      -84.37173
    ]
  },
  {
    "id": "liberty112",
    "name": "Liberty 112",
    "address": "7655 Princeton Road, Liberty Township, OH",
    "source": "https://www.liberty-township.com/facilities/facility/details/liberty-fire-station-112-13",
    "ll": [
      39.39095,
      -84.367853
    ]
  },
  {
    "id": "blueashsouth",
    "name": "Blue Ash · South",
    "address": "4343 Cooper Road, Blue Ash, OH",
    "source": "https://www.blueash.com/Admin/Community%20Newsletters/2024/2024%20spring%20newsletter%20final%20for%20web.pdf",
    "ll": [
      39.236506,
      -84.389194
    ]
  },
  {
    "id": "montgomery",
    "name": "Montgomery FD",
    "address": "10150 Montgomery Road, Montgomery, OH",
    "source": "https://storage.googleapis.com/proudcity/montgomeryoh/2025/09/233060-City-of-Montgomery-October-2025-Bulletin-16-pg_FINAL-1.pdf",
    "ll": [
      39.242987,
      -84.346646
    ]
  },
  {
    "id": "sycamore92",
    "name": "Sycamore 92",
    "address": "8540 Kenwood Road, Sycamore Township, OH",
    "source": "https://www.sycamoretownshipfire.org/contact-us.html",
    "ll": [
      39.212874,
      -84.378402
    ]
  },
  {
    "id": "forestpark",
    "name": "Forest Park FD",
    "address": "1201 West Kemper Road, Forest Park, OH",
    "source": "https://www.nationaltestingnetwork.com/publicsafetyjobs/fullJobDetails.cfm?agencyjobid=1748&agentid=1047&jobid=2",
    "ll": [
      39.288142,
      -84.524392
    ]
  },
  {
    "id": "fairfield33",
    "name": "Fairfield 33",
    "address": "6118 Winton Road, Fairfield, OH",
    "source": "https://www.fairfield-city.org/m/directory/department?did=12",
    "ll": [
      39.31338,
      -84.54124
    ]
  }
];
// Curated geographic shortlists for the highway options displayed in hospital-map-context.js.
// Ordered along the trip; not a closest-unit calculation or dispatch assignment.
const south=[['Lockland','I-75 · Lockland'],['cfd2','I-75 · Seymour / Carthage'],['cfd38','I-75 · Mitchell / Winton Place'],['cfd12','I-75 · Hopple / Camp Washington']];
const east=[['Lockland','I-75 · Lockland'],['Reading · Valley','SR-126 · Reading'],['blueashsouth','SR-126 · Blue Ash / Kenwood']];
const north=[['Sharonville HQ','I-75 / I-275 interchange'],['wc73','I-75 · northern industrial corridor'],['wc71','I-75 · Union Centre area'],['wc75','I-75 · Tylersville area']];
export const routeBackup={
 fairfield:[['Sharonville HQ','I-75 / I-275 interchange'],['Springdale','I-275 west · Springdale'],['forestpark','I-275 / Winton Road'],['fairfield33','Winton / Mack Road area']],
 bethesda:[...east,['montgomery','I-71 / Pfeiffer · near Bethesda North']],
 jewish:[...east,['sycamore92','Kenwood / Galbraith · near Jewish']],
 ucmc:[...south,['cfd19','Corryville · near UCMC']],
 samaritan:[...south,['cfd34','Clifton · near Good Samaritan']],
 christ:[...south,['cfd5','Over-the-Rhine / Mt. Auburn approach']],
 'childrens-main':[...south,['cfd32','Avondale · near Children’s Burnet']],
 westchester:north,
 'childrens-liberty':[...north,['liberty112','Liberty / Yankee Road · near campus']]
};
