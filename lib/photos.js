// Photo catalogue. To swap in real photos:
//   1. Drop the JPEG into public/images/gallery/ using the same filename
//      (or change `file`), any size/aspect ratio — dimensions are read at build.
//   2. Update `title` and `alt` so they describe the REAL photo.
//   3. Rebuild. Nothing else to touch.
//
// `location` is the filter category. Note: "Wildlife" is a subject, not a place;
// it lives here because the brief lists it alongside the locations. If you later
// want "Wildlife in Monterey Bay", add a separate `subject` field instead of
// overloading this one.

export const LOCATIONS = ['San Francisco', 'Alcatraz', 'Jamaica', 'Monterey Bay', 'Ruby Beach', 'Wildlife'];

export const locationSlug = (location) => location.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// orientation is only used by the placeholder generator; real files win.
export const photos = [
  { file: 'sf-golden-gate-fog.jpg', location: 'San Francisco', orientation: 'landscape', title: 'Golden Gate in Fog', alt: 'Golden Gate Bridge towers rising through low summer fog' },
  { file: 'sf-painted-ladies.jpg', location: 'San Francisco', orientation: 'portrait', title: 'Painted Ladies', alt: 'Row of pastel Victorian houses at Alamo Square at dusk' },
  { file: 'sf-lombard-night.jpg', location: 'San Francisco', orientation: 'portrait', title: 'Lombard After Dark', alt: 'Light trails winding down Lombard Street at night' },
  { file: 'sf-bay-bridge-blue-hour.jpg', location: 'San Francisco', orientation: 'landscape', title: 'Bay Bridge Blue Hour', alt: 'Bay Bridge lights reflected in calm water during blue hour' },
  { file: 'sf-sutro-baths.jpg', location: 'San Francisco', orientation: 'landscape', title: 'Sutro Baths', alt: 'Ruins of Sutro Baths with waves breaking at sunset' },
  { file: 'sf-twin-peaks.jpg', location: 'San Francisco', orientation: 'portrait', title: 'From Twin Peaks', alt: 'San Francisco skyline viewed from Twin Peaks at twilight' },
  { file: 'alcatraz-cellblock.jpg', location: 'Alcatraz', orientation: 'portrait', title: 'Cellblock Corridor', alt: 'Long corridor of empty cells inside the Alcatraz main cellhouse' },
  { file: 'alcatraz-from-pier.jpg', location: 'Alcatraz', orientation: 'landscape', title: 'The Rock from Pier 33', alt: 'Alcatraz Island seen across the bay from Pier 33' },
  { file: 'alcatraz-lighthouse.jpg', location: 'Alcatraz', orientation: 'portrait', title: 'Alcatraz Lighthouse', alt: 'Alcatraz lighthouse against a dramatic cloudy sky' },
  { file: 'alcatraz-water-tower.jpg', location: 'Alcatraz', orientation: 'landscape', title: 'Water Tower', alt: 'Weathered water tower on Alcatraz with graffiti visible' },
  { file: 'alcatraz-dusk.jpg', location: 'Alcatraz', orientation: 'landscape', title: 'Island at Dusk', alt: 'Silhouette of Alcatraz Island under an orange dusk sky' },
  { file: 'jamaica-seven-mile-beach.jpg', location: 'Jamaica', orientation: 'landscape', title: 'Seven Mile Beach', alt: 'Turquoise water and white sand along Seven Mile Beach, Negril' },
  { file: 'jamaica-dunns-river.jpg', location: 'Jamaica', orientation: 'portrait', title: "Dunn's River Falls", alt: "Water cascading over terraced rocks at Dunn's River Falls" },
  { file: 'jamaica-blue-mountains.jpg', location: 'Jamaica', orientation: 'landscape', title: 'Blue Mountains Morning', alt: 'Mist settling in the valleys of the Blue Mountains at sunrise' },
  { file: 'jamaica-ricks-cafe.jpg', location: 'Jamaica', orientation: 'portrait', title: "Cliffs at Rick's Café", alt: "Cliff diver mid-air above the sea at Rick's Café, Negril" },
  { file: 'jamaica-palms.jpg', location: 'Jamaica', orientation: 'portrait', title: 'Palms and Sky', alt: 'Tall coconut palms leaning against a clear blue sky' },
  { file: 'monterey-bixby-bridge.jpg', location: 'Monterey Bay', orientation: 'landscape', title: 'Bixby Creek Bridge', alt: 'Bixby Creek Bridge spanning a canyon above the Pacific' },
  { file: 'monterey-cypress.jpg', location: 'Monterey Bay', orientation: 'portrait', title: 'Lone Cypress', alt: 'Lone cypress tree clinging to a granite outcrop above the ocean' },
  { file: 'monterey-wharf.jpg', location: 'Monterey Bay', orientation: 'landscape', title: "Fisherman's Wharf", alt: "Boats moored beside Monterey's Fisherman's Wharf at sunrise" },
  { file: 'monterey-kelp-forest.jpg', location: 'Monterey Bay', orientation: 'portrait', title: 'Kelp Forest', alt: 'Sunlight filtering through a towering kelp forest underwater' },
  { file: 'monterey-point-lobos.jpg', location: 'Monterey Bay', orientation: 'landscape', title: 'Point Lobos Coves', alt: 'Emerald coves and rocky headlands at Point Lobos' },
  { file: 'ruby-beach-sea-stacks.jpg', location: 'Ruby Beach', orientation: 'landscape', title: 'Sea Stacks', alt: 'Sea stacks rising from the surf at Ruby Beach, Olympic Peninsula' },
  { file: 'ruby-beach-driftwood.jpg', location: 'Ruby Beach', orientation: 'portrait', title: 'Driftwood Maze', alt: 'Bleached driftwood logs piled across the beach under grey skies' },
  { file: 'ruby-beach-abbey-island.jpg', location: 'Ruby Beach', orientation: 'landscape', title: 'Abbey Island Sunset', alt: 'Abbey Island silhouetted against a pink sunset' },
  { file: 'ruby-beach-tidepool.jpg', location: 'Ruby Beach', orientation: 'portrait', title: 'Tidepool Reflections', alt: 'Sea stack reflected in a still tidepool at low tide' },
  { file: 'ruby-beach-fog.jpg', location: 'Ruby Beach', orientation: 'landscape', title: 'Coastal Fog', alt: 'Dense fog rolling over Ruby Beach and the forest beyond' },
  { file: 'wildlife-sea-otter.jpg', location: 'Wildlife', orientation: 'landscape', title: 'Sea Otter Afloat', alt: 'Sea otter floating on its back, holding a shell on its chest' },
  { file: 'wildlife-pelican.jpg', location: 'Wildlife', orientation: 'portrait', title: 'Brown Pelican', alt: 'Brown pelican perched on a weathered wooden piling' },
  { file: 'wildlife-sea-lions.jpg', location: 'Wildlife', orientation: 'landscape', title: 'Sea Lions at Rest', alt: 'California sea lions crowded on a floating dock' },
  { file: 'wildlife-humpback.jpg', location: 'Wildlife', orientation: 'landscape', title: 'Humpback Breach', alt: 'Humpback whale breaching out of the water in Monterey Bay' },
  { file: 'wildlife-heron.jpg', location: 'Wildlife', orientation: 'portrait', title: 'Great Blue Heron', alt: 'Great blue heron standing still in shallow marsh water' },
  { file: 'wildlife-hummingbird.jpg', location: 'Wildlife', orientation: 'portrait', title: "Anna's Hummingbird", alt: "Anna's hummingbird hovering beside a red flower" },
  { file: 'wildlife-harbor-seal.jpg', location: 'Wildlife', orientation: 'landscape', title: 'Harbor Seal', alt: 'Harbor seal resting on a rock with its head raised' },
].map((p) => ({ ...p, id: p.file.replace(/\.[a-z]+$/, ''), src: `/images/gallery/${p.file}` }));

export const hero = {
  file: 'hero.jpg',
  src: '/images/hero.jpg',
  alt: 'Pacific coastline at golden hour with layered headlands fading into haze',
};
