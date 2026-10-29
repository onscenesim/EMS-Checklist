"""Extract real building outlines from the cached district map; never invent building shapes."""
import json, pathlib, subprocess, xml.etree.ElementTree as ET, math
root=pathlib.Path(__file__).resolve().parents[1]
places=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {destinations} from './dist/local-destinations.js';console.log(JSON.stringify(destinations))"],cwd=root))
nodes={};ways={}
for path in (root.parent/'tmp/practice-data').glob('-84.*.osm'):
 for e in ET.parse(path).getroot():
  if e.tag=='node':nodes[e.get('id')]=[float(e.get('lat')),float(e.get('lon'))]
  elif e.tag=='way':ways[e.get('id')]=e
buildings=[]
def dist(p,ring):
 inside=False;best=1e9
 for a,b in zip(ring,ring[1:]):
  if (a[0]>p[0])!=(b[0]>p[0]) and p[1]<(b[1]-a[1])*(p[0]-a[0])/(b[0]-a[0])+a[1]:inside=not inside
  x=(b[1]-a[1])*86000;y=(b[0]-a[0])*111000;px=(p[1]-a[1])*86000;py=(p[0]-a[0])*111000;t=max(0,min(1,(px*x+py*y)/(x*x+y*y or 1)));best=min(best,math.hypot(px-t*x,py-t*y))
 return 0 if inside else best
for id,e in ways.items():
 tags={t.get('k'):t.get('v') for t in e.findall('tag')}
 if not tags.get('building') or tags['building']=='roof':continue
 refs=[n.get('ref') for n in e.findall('nd')]
 if any(n not in nodes for n in refs):continue
 ring=[nodes[n] for n in refs]
 if len(ring)<4 or ring[0]!=ring[-1]:continue
 center=[sum(p[i] for p in ring[:-1])/(len(ring)-1) for i in range(2)]
 if not (39.227<center[0]<39.27 and -84.485<center[1]<-84.44):continue
 area=abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(ring,ring[1:])))*111000*86000/2
 buildings.append(dict(id=id,ll=ring,center=center,area=round(area),name='',station=False))
ids={'woodlawn-fd','lincoln-fd','kroger-store','kroger-warehouse','national-guard','transport','recreation','woodlawn-school','woodlawn-pd','lincoln-school','glendale-care','goodwill','idea','major-tire','century-inn','friendship','commons'}
for place in places:
 if place['id'] not in ids:continue
 choices=sorted(buildings,key=lambda b:dist(place['ll'],b['ll']))
 overrides={'kroger-warehouse':'36951688','recreation':'64168206'}
 b=next((b for b in choices if b['id']==overrides[place['id']]),None) if place['id'] in overrides else choices[0]
 if b and (place['id'] in overrides or dist(place['ll'],b['ll'])<65):
  b['name']=place['name'];b['station']=place['id'] in ('woodlawn-fd','lincoln-fd');print(place['id'],b['id'],round(dist(place['ll'],b['ll'])))
selected=[b for b in buildings if b['area']>=300 or b['name']]
(root/'dist/landmark-buildings.js').write_text('// Real OpenStreetMap building outlines from cached district extracts.\nexport const landmarkBuildings='+json.dumps(selected,separators=(',',':'))+';\nexport const buildingNameVisible=(building,position,zoom,names=true)=>names&&zoom>=16&&Math.hypot((position[0]-building.center[0])*111000,(position[1]-building.center[1])*86000)<=250;\n')
print('Building footprints:',len(selected))
