/* Default city sets for the two /us/ dot maps. In a data module so the
   page and /admin/ Locations edit the same truth. Coordinates are
   normalised 0..1 inside each map's outline box. */

export const SA_CITIES = [
  { x: .72, y: .335, n: 'Benoni — the factory', d: 'Every panel starts here: welded at every crossing and coated in Benoni South, Gauteng.', home: true },
  { x: .685, y: .35, n: 'Johannesburg', d: 'Home turf — Steyn City, PRASA and the rest of the roster.' },
  { x: .705, y: .285, n: 'Pretoria', d: 'Gauteng deliveries run constantly.' },
  { x: .885, y: .615, n: 'Durban', d: 'Coastal air calls for the hot-dip galvanized finish.' },
  { x: .12, y: .92, n: 'Cape Town', d: 'Nationwide delivery — coast to coast.' },
  { x: .55, y: .92, n: 'Gqeberha', d: 'Eastern Cape, delivered.' },
  { x: .59, y: .55, n: 'Bloemfontein', d: 'Free State, delivered.' },
  { x: .79, y: .15, n: 'Polokwane', d: 'Limpopo, delivered.' },
  { x: .875, y: .275, n: 'Mbombela', d: 'Mpumalanga, delivered.' },
  { x: .50, y: .53, n: 'Kimberley', d: 'Northern Cape, delivered.' },
]

export const US_CITIES = [
  { x: .774, y: .95, n: 'Fort Lauderdale — Guard Master US', d: 'Head office. Dollar quotes, container or crate, shipped across the continental US.', home: true },
  { x: .879, y: .35, n: 'New York', d: 'East coast shipping destination, out of the Florida desk.' },
  { x: .645, y: .30, n: 'Chicago', d: 'Midwest shipping destination.' },
  { x: .486, y: .68, n: 'Dallas', d: 'Texas perimeters are exactly what 358 mesh was made for.' },
  { x: .117, y: .62, n: 'Los Angeles', d: 'West coast shipping destination — the mesh doesn’t mind the distance.' },
  { x: .047, y: .06, n: 'Seattle', d: 'Pacific Northwest shipping destination.' },
  { x: .345, y: .39, n: 'Denver', d: 'Mountain-states shipping destination.' },
  { x: .700, y: .64, n: 'Atlanta', d: 'Southeast shipping destination.' },
]
