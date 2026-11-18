// Scene units and animation rates are illustrative, not physical measurements.
export const bodies = [
  {
    id: 'sun', name: 'Sun', kind: 'OUR HOME STAR', radius: 1.65, orbitRadius: 0,
    color: '#ffc96a', surface: 'star', orbitSpeed: 0, phase: 0,
    description: 'The star at the center of it all. The Sun holds almost all the mass in our solar system, turning hydrogen into the light that reaches Earth about eight minutes later.',
    distance: 'At the center', year: 'Not applicable', day: '~25-35 Earth days',
  },
  {
    id: 'mercury', name: 'Mercury', kind: 'TERRESTRIAL PLANET', radius: 0.30, orbitRadius: 3.4,
    color: '#a9a29a', surface: 'rocky', orbitSpeed: 0.26, phase: 0.8,
    description: 'Small, rocky and closest to the Sun. Without a substantial atmosphere to hold heat, Mercury swings between scorching days and intensely cold nights.',
    distance: '0.39 AU', year: '88 Earth days', day: '59 Earth days',
  },
  {
    id: 'venus', name: 'Venus', kind: 'TERRESTRIAL PLANET', radius: 0.53, orbitRadius: 5.2,
    color: '#e5bb83', surface: 'cloudy', orbitSpeed: 0.19, phase: 3.7,
    description: 'Wrapped in thick clouds, Venus is the hottest planet. Its dense carbon dioxide atmosphere traps heat, and it rotates in the opposite direction to most planets.',
    distance: '0.72 AU', year: '225 Earth days', day: '243 Earth days',
  },
  {
    id: 'earth', name: 'Earth', kind: 'TERRESTRIAL PLANET', radius: 0.58, orbitRadius: 7.2,
    color: '#71b9d1', surface: 'earth', orbitSpeed: 0.14, phase: 2.15,
    description: 'Our pale blue home. Liquid oceans cover about 71% of its surface, and a thin atmosphere shelters the only life we know of in the universe.',
    distance: '1.00 AU', year: '365.25 days', day: '~24 hours',
  },
  {
    id: 'mars', name: 'Mars', kind: 'TERRESTRIAL PLANET', radius: 0.43, orbitRadius: 9.2,
    color: '#d78562', surface: 'rocky', orbitSpeed: 0.11, phase: 5.5,
    description: 'A rusty world with a watery past. Mars has polar ice caps, vast canyons and Olympus Mons, the largest volcano in the solar system.',
    distance: '1.52 AU', year: '687 Earth days', day: '24 h 37 min',
  },
  {
    id: 'jupiter', name: 'Jupiter', kind: 'GAS GIANT', radius: 1.30, orbitRadius: 12.2,
    color: '#d7b79a', surface: 'gas', orbitSpeed: 0.065, phase: 0.65,
    description: 'The giant of the family. Jupiter is more massive than all the other planets combined, with cloud bands and a Great Red Spot that is a long-lived storm.',
    distance: '5.20 AU', year: '11.86 Earth years', day: '~10 hours',
  },
  {
    id: 'saturn', name: 'Saturn', kind: 'GAS GIANT', radius: 1.05, orbitRadius: 15.5,
    color: '#e4cd9d', surface: 'gas', orbitSpeed: 0.048, phase: 3.45, rings: true,
    description: 'An unmistakable silhouette. Saturn’s rings are made mostly of countless pieces of ice, from tiny grains to much larger chunks.',
    distance: '9.58 AU', year: '29.45 Earth years', day: '~10.7 hours',
  },
  {
    id: 'uranus', name: 'Uranus', kind: 'ICE GIANT', radius: 0.78, orbitRadius: 19,
    color: '#9ad9db', surface: 'cloudy', orbitSpeed: 0.034, phase: 4.65,
    description: 'A world tipped on its side. Uranus has an extreme axial tilt, and methane in its atmosphere helps give the planet its pale blue-green appearance.',
    distance: '19.2 AU', year: '84 Earth years', day: '~17 hours',
  },
  {
    id: 'neptune', name: 'Neptune', kind: 'ICE GIANT', radius: 0.74, orbitRadius: 22.5,
    color: '#648edb', surface: 'cloudy', orbitSpeed: 0.026, phase: 2.15,
    description: 'The outermost planet, far from the Sun’s warmth. Neptune’s atmosphere hosts powerful winds, while one orbit takes about 165 Earth years.',
    distance: '30.1 AU', year: '165 Earth years', day: '~16 hours',
  },
];
