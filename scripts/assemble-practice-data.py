# Convert cached OSM XML and directed OSRM hospital approaches into the shared graph input.
import json, pathlib, xml.etree.ElementTree as ET
root=pathlib.Path(__file__).resolve().parents[2]/'tmp'
folder=root/'practice-data'
xmls=list(folder.glob('*.osm')) or [root/'practice-tile.osm']
nodes={};ways={};addresses={}
for path in xmls:
    doc=ET.parse(path).getroot()
    for e in doc:
        tags={t.attrib['k']:t.attrib['v'] for t in e.findall('tag')}
        if e.tag=='node':
            node={'type':'node','id':int(e.attrib['id']),'lat':float(e.attrib['lat']),'lon':float(e.attrib['lon']),'tags':tags}
            nodes[node['id']]=node
            if 'addr:housenumber' in tags: addresses[node['id']]=node
        elif e.tag=='way':
            ways[int(e.attrib['id'])]={'type':'way','id':int(e.attrib['id']),'nodes':[int(n.attrib['ref']) for n in e.findall('nd')],'tags':tags}
allowed={'motorway','motorway_link','trunk','trunk_link','primary','primary_link','secondary','secondary_link','tertiary','tertiary_link','residential','unclassified','living_street','service'}
elements=list(addresses.values())
for w in ways.values():
    if not all(n in nodes for n in w['nodes']): continue
    w['geometry']=[{'lat':nodes[n]['lat'],'lon':nodes[n]['lon']} for n in w['nodes']]
    if w['tags'].get('highway') in allowed or 'addr:housenumber' in w['tags']: elements.append(w)
local_pairs={tuple(sorted((a,b))) for w in elements if w.get('tags',{}).get('highway') in allowed for a,b in zip(w['nodes'],w['nodes'][1:])}
route_pairs=set()
coord=lambda lat,lon:(round(lat,6),round(lon,6))
lookup={coord(n['lat'],n['lon']):i for i,n in nodes.items()};newid=-1
for path in folder.glob('*.json'):
    data=json.loads(path.read_text())
    for leg in data['routes'][0]['legs']:
        for step in leg['steps']:
            points=step['geometry']['coordinates']
            if len(points)<2: continue
            ids=[];geometry=[]
            for lon,lat in points:
                key=coord(lat,lon)
                if key not in lookup:
                    lookup[key]=newid;newid-=1
                ids.append(lookup[key]);geometry.append({'lat':lat,'lon':lon})
            name=step.get('name') or step.get('ref') or 'Access road'
            # Preserve local one-way tags; add only corridor segments not already in the district graph.
            for i,(a,b) in enumerate(zip(ids,ids[1:])):
                if a==b or tuple(sorted((a,b))) in local_pairs or (a,b) in route_pairs: continue
                route_pairs.add((a,b))
                elements.append({'type':'way','id':newid,'nodes':[a,b],'geometry':geometry[i:i+2],'tags':{'highway':'motorway' if step.get('ref','').startswith('I ') else 'service' if name=='Access road' else 'primary','name':name,'oneway':'yes','practice:corridor':'yes'}})
                newid-=1
(root/'practice-assembled.json').write_text(json.dumps({'elements':elements},separators=(',',':')))
print(len(nodes),'OSM nodes;',len(elements),'ways / addresses / route segments')
