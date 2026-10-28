export type IconName =
  | 'portrait'
  | 'home'
  | 'art'
  | 'jewellery'
  | 'tech'
  | 'toys'
  | 'food'
  | 'prototypes'
  | 'health'
  | 'automotive'
  | 'scan'
  | 'model'
  | 'print'
  | 'finish'
  | 'batch'
  | 'review'
  | 'layers'
  | 'sparkle'
  | 'truck'
  | 'leaf'
  | 'shield'
  | 'star'

export interface ShopCategory {
  id: string
  name: string
  tagline: string
  description: string
  icon: IconName
  count: string
  tint: string
  feature: {
    eyebrow: string
    title: string
    blurb: string
    href: string
    image?: string
    cta: string
  }
  subcategories: { name: string; note: string }[]
}

export interface Product {
  id: string
  name: string
  category: string
  categoryLabel: string
  type: 'ready' | 'order' | 'custom'
  price: number
  pricePrefix?: string
  badge?: string
  availability: string
  lead: string
  image: string
  tone: string
  blurb: string
  description: string
  materials: string[]
  sizes?: string[]
  dimensions: string
  rating: number
  reviewCount: number
}

export interface Project {
  id: string
  title: string
  client: string
  location: string
  year: string
  tags: string[]
  filter: 'personal' | 'home' | 'industry' | 'jewellery'
  image: string
  size: 'wide' | 'tall' | 'standard'
  blurb: string
  story: string
  materials: string
  duration: string
}

export interface Review {
  id: string
  quote: string
  name: string
  location: string
  project: string
  productId?: string
  projectId?: string
  rating: number
  date: string
  tone: string
  initials: string
}

export interface Finish {
  id: string
  name: string
  note: string
  description: string
  swatch: string
  color: string
  roughness: number
  metalness: number
  clearcoat: number
  transmission: number
}

export const shopCategories: ShopCategory[] = [
  {
    id: 'personalised',
    name: 'Personalised',
    tagline: 'Likenesses, keepsakes, and gifts with a heartbeat.',
    description:
      'Our signature studio service. Send a photograph, a memory, or an idea — we sculpt it into an object made only for you.',
    icon: 'portrait',
    count: '24+ pieces',
    tint: '#efe4d7',
    feature: {
      eyebrow: 'The signature piece',
      title: 'The Portrait',
      blurb: 'A museum-grade bust sculpted from your photograph. From $189.',
      href: '#portrait',
      image: '/renders/portrait-bust.jpg',
      cta: 'Meet the Portrait',
    },
    subcategories: [
      { name: 'Portrait busts', note: 'Sculpted from your photographs' },
      { name: 'Pet sculptures', note: 'A faithful study of your companion' },
      { name: 'Couple figurines', note: 'The two of you, cast as one piece' },
      { name: 'Wedding keepsakes', note: 'Toppers, vessels, and anniversaries' },
      { name: 'Photo reliefs', note: 'A moment held in shallow relief' },
      { name: 'Memorial pieces', note: 'A quiet way to remember' },
    ],
  },
  {
    id: 'home',
    name: 'Home & Living',
    tagline: 'Objects that earn their place.',
    description:
      'Lighting, vessels, planters, and small architecture for the everyday. Designed in our studio, printed to order.',
    icon: 'home',
    count: '86+ pieces',
    tint: '#e3e8dd',
    feature: {
      eyebrow: 'From the collection',
      title: 'Möbius Vase',
      blurb: 'A continuous fluted form in recycled ceramic. From $86.',
      href: '#collection',
      image: '/renders/mobius-vase.jpg',
      cta: 'Shop the collection',
    },
    subcategories: [
      { name: 'Vases & vessels', note: 'Sculptural forms for stems and branches' },
      { name: 'Lighting', note: 'Lamps, pendants, and warm pools of light' },
      { name: 'Planters', note: 'Quiet homes for growing things' },
      { name: 'Wall art', note: 'Reliefs and objects for the wall' },
      { name: 'Sculptural objects', note: 'Small monuments for a shelf' },
      { name: 'Home accessories', note: 'Trays, hooks, clocks, and details' },
    ],
  },
  {
    id: 'art',
    name: 'Art & Collectibles',
    tagline: 'Small editions. Lasting presence.',
    description:
      'Figures, replicas, miniatures, and commissions — precise down to the layer and considered from every angle.',
    icon: 'art',
    count: '64+ pieces',
    tint: '#e7e1ec',
    feature: {
      eyebrow: 'Editioned objects',
      title: 'Companion No. 4',
      blurb: 'A numbered sculptural figure in soft-touch resin. Edition of 50.',
      href: '#collection',
      image: '/renders/companion-four.jpg',
      cta: 'View editions',
    },
    subcategories: [
      { name: 'Figurines & characters', note: 'Original sculpts and character studies' },
      { name: 'Miniatures', note: 'Small worlds, finely observed' },
      { name: 'Museum replicas', note: 'Reconsidered fragments and forms' },
      { name: 'Wall reliefs', note: 'Sculpture for flat surfaces' },
      { name: 'Sculptural editions', note: 'Numbered, dated, and documented' },
      { name: 'Commissioned artworks', note: 'One-off pieces made with artists' },
    ],
  },
  {
    id: 'jewellery',
    name: 'Jewellery & Wear',
    tagline: 'Wearable, personal, precise.',
    description:
      'Rings, pendants, and accessories printed in castable resin or finished metal. Small objects, closely observed.',
    icon: 'jewellery',
    count: '38+ pieces',
    tint: '#f0e1e0',
    feature: {
      eyebrow: 'Worn daily',
      title: 'Aster Ring',
      blurb: 'Lost-cast in recycled silver, then hand-finished. From $120.',
      href: '#collection',
      image: '/renders/aster-ring.jpg',
      cta: 'Explore jewellery',
    },
    subcategories: [
      { name: 'Rings', note: 'Sculptural bands and signets' },
      { name: 'Pendants', note: 'Small gestures, close to the heart' },
      { name: 'Earrings & cuffs', note: 'Architectural forms in lightness' },
      { name: 'Cufflinks & pins', note: 'Quiet details for formal days' },
      { name: 'Eyewear frames', note: 'Made to your measurements' },
      { name: 'Cosplay & props', note: 'Armour, weapons, and character work' },
    ],
  },
  {
    id: 'tech',
    name: 'Tech & Hobby',
    tagline: 'Better gear, made for you.',
    description:
      'Desk systems, mounts, drone parts, and the small improvements that make a workspace feel considered.',
    icon: 'tech',
    count: '52+ pieces',
    tint: '#e1e4e5',
    feature: {
      eyebrow: 'Studio pick',
      title: 'Orbit Desk System',
      blurb: 'Tray, dock, and pen well in one considered piece. $72.',
      href: '#collection',
      image: '/renders/orbit-desk.jpg',
      cta: 'Shop desk objects',
    },
    subcategories: [
      { name: 'Desk organisation', note: 'Trays, wells, and quiet order' },
      { name: 'Phone & tablet stands', note: 'Weighted, considered viewing angles' },
      { name: 'Drone & RC parts', note: 'Stiff, light, and replaceable' },
      { name: 'Robotics', note: 'Brackets, chassis, and custom mounts' },
      { name: 'Model kits & trains', note: 'Parts for worlds in miniature' },
      { name: 'Replacement parts', note: 'The thing you cannot buy anymore' },
    ],
  },
  {
    id: 'toys',
    name: 'Toys & Games',
    tagline: 'Play, finely made.',
    description:
      'Tabletop armies, terrain, dice towers, educational models, and toys designed to be handled for years.',
    icon: 'toys',
    count: '46+ pieces',
    tint: '#dde6ea',
    feature: {
      eyebrow: 'For the table',
      title: 'Kite Tabletop Set',
      blurb: 'A pocket-sized ruin for your next campaign. From $64.',
      href: '#collection',
      image: '/renders/kite-tabletop.jpg',
      cta: 'Shop tabletop',
    },
    subcategories: [
      { name: 'Tabletop miniatures', note: 'Heroes, monsters, and NPCs' },
      { name: 'Terrain & scenery', note: 'Ruins, trees, and modular worlds' },
      { name: 'Dice towers', note: 'A little ceremony for every roll' },
      { name: 'Educational toys', note: 'Models that reward curiosity' },
      { name: 'Puzzles', note: 'Objects with a hidden order' },
      { name: 'Board-game inserts', note: 'A place for every piece' },
    ],
  },
  {
    id: 'food',
    name: 'Food & Events',
    tagline: 'Occasions, made tangible.',
    description:
      'Celebration pieces, moulds, and favours, printed in food-safe materials. For weddings, tables, and good days.',
    icon: 'food',
    count: '31+ pieces',
    tint: '#f2e8d8',
    feature: {
      eyebrow: 'For celebrating',
      title: 'Arc Topper',
      blurb: 'A delicate keepsake arc for the cake — and after. $48.',
      href: '#collection',
      image: '/renders/arc-topper.jpg',
      cta: 'Shop celebrations',
    },
    subcategories: [
      { name: 'Cake toppers', note: 'The first photograph of the day' },
      { name: 'Cookie cutters', note: 'Custom shapes, clean edges' },
      { name: 'Chocolate moulds', note: 'Food-safe, finely detailed' },
      { name: 'Party favours', note: 'Small gifts for long tables' },
      { name: 'Table centrepieces', note: 'Architecture for a celebration' },
      { name: 'Seasonal décor', note: 'Objects for returning rituals' },
    ],
  },
  {
    id: 'prototypes',
    name: 'Prototypes & Industry',
    tagline: 'From sketch to working part.',
    description:
      'Rapid prototypes, functional components, enclosures, jigs, and small production runs — with engineering support from the first file.',
    icon: 'prototypes',
    count: 'Custom',
    tint: '#e6e5e0',
    feature: {
      eyebrow: 'The print bureau',
      title: 'Echo House',
      blurb: 'A 1:200 architectural study, printed in fine white layers. From $480.',
      href: '#collection',
      image: '/renders/echo-house.jpg',
      cta: 'See architectural models',
    },
    subcategories: [
      { name: 'Rapid prototyping', note: 'From CAD to object in days' },
      { name: 'Functional parts', note: 'Engineered for real loads' },
      { name: 'Electronics enclosures', note: 'Custom fit, clean details' },
      { name: 'Jigs & fixtures', note: 'Repeatable tools for the bench' },
      { name: 'Small-batch production', note: '1 to 5,000, quality assured' },
      { name: 'Architectural models', note: 'Scale, section, and context' },
    ],
  },
  {
    id: 'health',
    name: 'Health & Science',
    tagline: 'Models that clarify.',
    description:
      'Anatomical studies, dental and lab aids, assistive devices, and scientific models, made with dimensional care.',
    icon: 'health',
    count: '19+ pieces',
    tint: '#e2e9e8',
    feature: {
      eyebrow: 'Precision objects',
      title: 'Arch Study',
      blurb: 'A dimensional dental reference, printed in matte plaster. From $140.',
      href: '#collection',
      image: '/renders/arch-study.jpg',
      cta: 'Explore medical models',
    },
    subcategories: [
      { name: 'Anatomical models', note: 'Study, explain, and teach' },
      { name: 'Dental models', note: 'Reference arches and guides' },
      { name: 'Laboratory aids', note: 'Custom holders and fixtures' },
      { name: 'Assistive devices', note: 'Made around a person' },
      { name: 'Orthotic studies', note: 'Form studies with clinical partners' },
      { name: 'Research prototypes', note: 'Quick iterations for the lab' },
    ],
  },
  {
    id: 'automotive',
    name: 'Automotive & Repair',
    tagline: 'The part that no longer exists.',
    description:
      'Interior trim, knobs, clips, brackets, and restoration pieces — reverse-engineered, printed, and finished to fit.',
    icon: 'automotive',
    count: '27+ pieces',
    tint: '#e4e1dc',
    feature: {
      eyebrow: 'Made to fit',
      title: 'Marlowe Knob',
      blurb: 'A weighted shift knob in matte graphite and brass. $64.',
      href: '#collection',
      image: '/renders/marlowe-knob.jpg',
      cta: 'Shop automotive',
    },
    subcategories: [
      { name: 'Interior trim', note: 'Clips, bezels, and small covers' },
      { name: 'Replacement knobs', note: 'Tactile, weighted, yours' },
      { name: 'Brackets & mounts', note: 'Holders for cameras and radios' },
      { name: 'Custom adaptors', note: 'Two things that should fit' },
      { name: 'Scale models', note: 'Cars, built one layer at a time' },
      { name: 'Restoration parts', note: 'Keeping the original on the road' },
    ],
  },
]

export const products: Product[] = [
  {
    id: 'portrait',
    name: 'The Portrait',
    category: 'personalised',
    categoryLabel: 'Personalised',
    type: 'custom',
    price: 189,
    pricePrefix: 'From',
    badge: 'Signature',
    availability: 'Made from your photograph',
    lead: '14–18 studio days',
    image: '/renders/portrait-bust.jpg',
    tone: '#e9dfd2',
    blurb: 'A museum-grade bust, sculpted from your photographs and finished by hand.',
    description:
      'The most personal object we make. Our artists translate three to five photographs into a digital sculpture, refine it with you, then print it in fine layers and hand-finish every surface. Each portrait arrives numbered with a certificate and a felt-lined plinth.',
    materials: ['Porcelain', 'Sandstone', 'Obsidian'],
    sizes: ['18 cm', '24 cm', '32 cm'],
    dimensions: '18–32 cm tall · felt-lined plinth included',
    rating: 4.9,
    reviewCount: 186,
  },
  {
    id: 'mobius-vase',
    name: 'Möbius Vase',
    category: 'home',
    categoryLabel: 'Home & Living',
    type: 'ready',
    price: 86,
    badge: 'Bestseller',
    availability: 'Ready to ship · 6 left',
    lead: 'Ships in 2–3 days',
    image: '/renders/mobius-vase.jpg',
    tone: '#e1e8db',
    blurb: 'A continuous fluted form, printed in recycled ceramic and finished in a soft matte glaze.',
    description:
      'A vase with no obvious beginning or end. Its fluted surface is generated by a single mathematical curve, then printed in recycled ceramic and hand-sanded to a chalk-soft finish. Watertight, with a removable glass insert for cut flowers.',
    materials: ['Sage', 'Porcelain', 'Obsidian'],
    sizes: ['22 cm', '32 cm'],
    dimensions: '22 × 12 cm · 1.2 kg',
    rating: 4.8,
    reviewCount: 94,
  },
  {
    id: 'halo-lamp',
    name: 'Halo Lamp',
    category: 'home',
    categoryLabel: 'Home & Living',
    type: 'order',
    price: 164,
    badge: 'New',
    availability: 'Made to order',
    lead: 'Ships in 7–10 days',
    image: '/renders/halo-lamp.jpg',
    tone: '#f0e3d5',
    blurb: 'A warm pool of light beneath a hand-finished, translucent shade.',
    description:
      'A small lamp with a large presence. The Halo shade is printed thinly enough to glow from within, while its weighted base keeps it steady. Dimmable through a soft-touch dial, with a warm 2700K bulb included.',
    materials: ['Ivory', 'Sandstone'],
    dimensions: '31 × 20 cm · 1.9 kg',
    rating: 4.9,
    reviewCount: 61,
  },
  {
    id: 'terra-planter',
    name: 'Terra Planter',
    category: 'home',
    categoryLabel: 'Home & Living',
    type: 'ready',
    price: 54,
    availability: 'Ready to ship · 12 left',
    lead: 'Ships in 2–3 days',
    image: '/renders/terra-planter.jpg',
    tone: '#e9e4da',
    blurb: 'A quiet home for small green things, with a hidden drainage well.',
    description:
      'A tapered, gently ribbed planter with a removeable inner cup and hidden water reservoir. Suitable for houseplants and herbs. The exterior is printed in a textured mineral finish that deepens with age.',
    materials: ['Sandstone', 'Sage', 'Obsidian'],
    sizes: ['12 cm', '18 cm'],
    dimensions: '18 × 16 cm · 0.9 kg',
    rating: 4.7,
    reviewCount: 132,
  },
  {
    id: 'orbit-desk',
    name: 'Orbit Desk System',
    category: 'tech',
    categoryLabel: 'Tech & Hobby',
    type: 'ready',
    price: 72,
    badge: 'Studio pick',
    availability: 'Ready to ship · 4 left',
    lead: 'Ships in 2–3 days',
    image: '/renders/orbit-desk.jpg',
    tone: '#e3e4e4',
    blurb: 'Tray, dock, and pen well in one weighted, considered piece.',
    description:
      'A quiet place for the things that gather on a desk. Orbit combines a shallow catch tray, a magnetic phone dock, and a removable pen well in a single weighted body. Lined with recycled felt underneath to protect surfaces.',
    materials: ['Graphite', 'Sandstone', 'Sage'],
    dimensions: '26 × 14 cm · 0.7 kg',
    rating: 4.8,
    reviewCount: 76,
  },
  {
    id: 'aster-ring',
    name: 'Aster Ring',
    category: 'jewellery',
    categoryLabel: 'Jewellery & Wear',
    type: 'order',
    price: 120,
    pricePrefix: 'From',
    availability: 'Made to order',
    lead: 'Ships in 10–14 days',
    image: '/renders/aster-ring.jpg',
    tone: '#f0dfde',
    blurb: 'A faceted band lost-cast in recycled silver and finished by hand.',
    description:
      'Modelled digitally, printed in castable resin, then lost-cast in recycled sterling silver. The Aster has thirteen quiet facets that catch the light without asking for attention. Made to order in whole sizes 5–12.',
    materials: ['Recycled silver', 'Gold vermeil'],
    sizes: ['US 5–12'],
    dimensions: 'Band width 5 mm · 4.2 g',
    rating: 5,
    reviewCount: 41,
  },
  {
    id: 'kite-tabletop',
    name: 'Kite Tabletop Set',
    category: 'toys',
    categoryLabel: 'Toys & Games',
    type: 'ready',
    price: 64,
    availability: 'Ready to ship · 9 left',
    lead: 'Ships in 2–3 days',
    image: '/renders/kite-tabletop.jpg',
    tone: '#dde6ea',
    blurb: 'A pocket-sized ruin, printed in nine modular pieces for your next campaign.',
    description:
      'A small, modular ruin for tabletop play. Nine pieces click together in any arrangement, from a lone watchtower to a forgotten courtyard. Printed in durable resin with a dry stone finish; supplied with a felt storage pouch.',
    materials: ['Terracotta', 'Stone grey'],
    dimensions: '12 × 12 cm assembled · 9 pieces',
    rating: 4.9,
    reviewCount: 58,
  },
  {
    id: 'echo-house',
    name: 'Echo Architectural Model',
    category: 'prototypes',
    categoryLabel: 'Prototypes & Industry',
    type: 'order',
    price: 480,
    pricePrefix: 'From',
    availability: 'Made to order',
    lead: 'Ships in 2–3 weeks',
    image: '/renders/echo-house.jpg',
    tone: '#e8e6e1',
    blurb: 'A 1:200 study in fine white layers, assembled from precision-printed parts.',
    description:
      'A presentation-grade architectural model for a real or imagined house. We work from your drawings or our studio brief, print at 0.08 mm layers, then assemble and finish. Scale and site footprint are tailored to your project.',
    materials: ['Bone white', 'Sandstone'],
    sizes: ['1:200', '1:100'],
    dimensions: '30 × 24 cm · 28 parts',
    rating: 5,
    reviewCount: 23,
  },
  {
    id: 'pulse-drone',
    name: 'Pulse Drone Frame',
    category: 'tech',
    categoryLabel: 'Tech & Hobby',
    type: 'order',
    price: 96,
    availability: 'Made to order',
    lead: 'Ships in 5–7 days',
    image: '/renders/pulse-drone.jpg',
    tone: '#dfe1df',
    blurb: 'A stiff, lightweight five-inch frame for custom builds and hard landings.',
    description:
      'A five-inch freestyle frame, designed in-house and printed in carbon-fibre nylon. The arms flex on impact, then return to true. Standard 30.5 × 30.5 mm stack pattern, 20 × 20 mm motor mounts, and a replaceable camera cage.',
    materials: ['Carbon nylon', 'Glass-filled nylon'],
    dimensions: '225 mm diagonal · 118 g',
    rating: 4.8,
    reviewCount: 34,
  },
  {
    id: 'companion-four',
    name: 'Companion No. 4',
    category: 'art',
    categoryLabel: 'Art & Collectibles',
    type: 'ready',
    price: 148,
    badge: 'Edition of 50',
    availability: 'Ready to ship · 3 left',
    lead: 'Ships in 2–3 days',
    image: '/renders/companion-four.jpg',
    tone: '#e8e1ee',
    blurb: 'A numbered sculptural figure in soft-touch resin, with a hand-brushed visor.',
    description:
      'The fourth character in our Companion series. Printed in a single piece in soft-touch resin, then hand-finished with a brushed metal visor. Each edition is numbered, stamped, and accompanied by a small printed story.',
    materials: ['Porcelain', 'Graphite', 'Sandstone'],
    dimensions: '19 cm tall · 0.6 kg',
    rating: 5,
    reviewCount: 49,
  },
  {
    id: 'atelier-dock',
    name: 'Atelier Phone Dock',
    category: 'tech',
    categoryLabel: 'Tech & Hobby',
    type: 'ready',
    price: 46,
    availability: 'Ready to ship · 18 left',
    lead: 'Ships in 2–3 days',
    image: '/renders/atelier-dock.jpg',
    tone: '#e5e1d8',
    blurb: 'A weighted dock with a soft felt seat, angled for the glance.',
    description:
      'A small, heavy dock cut from a single block of printed composite. The 68-degree angle keeps your phone at a glance, while the felt-lined seat protects the finish. Charges through the side, cable routed underneath.',
    materials: ['Graphite', 'Bone white', 'Terracotta'],
    dimensions: '12 × 8 cm · 0.5 kg',
    rating: 4.7,
    reviewCount: 88,
  },
  {
    id: 'marlowe-knob',
    name: 'Marlowe Shift Knob',
    category: 'automotive',
    categoryLabel: 'Automotive & Repair',
    type: 'order',
    price: 64,
    availability: 'Made to order',
    lead: 'Ships in 5–7 days',
    image: '/renders/marlowe-knob.jpg',
    tone: '#e0ddd8',
    blurb: 'A weighted knob in matte graphite and brass, machined to your thread.',
    description:
      'A heavy, warm object for a car you love. The Marlowe is printed in a dense composite, weighted with a brass core, and finished in soft-touch graphite. Made to your thread pitch, with a small engraved initial included.',
    materials: ['Graphite', 'Brass accent'],
    sizes: ['M10 × 1.25', 'M12 × 1.25'],
    dimensions: '58 mm tall · 190 g',
    rating: 4.9,
    reviewCount: 27,
  },
  {
    id: 'arc-topper',
    name: 'Arc Topper',
    category: 'food',
    categoryLabel: 'Food & Events',
    type: 'order',
    price: 48,
    availability: 'Made to order',
    lead: 'Ships in 7–10 days',
    image: '/renders/arc-topper.jpg',
    tone: '#f2e8d8',
    blurb: 'A delicate keepsake arc for the cake — and long after.',
    description:
      'A minimal celebration arch, printed in a food-safe finish and hand-polished. Personalise it with up to two names and a date, engraved in a fine serif. It becomes a small object for the shelf after the cake is gone.',
    materials: ['Pearl', 'Gold', 'Bone white'],
    sizes: ['12 cm', '16 cm'],
    dimensions: '16 × 12 cm · food-safe finish',
    rating: 4.9,
    reviewCount: 63,
  },
  {
    id: 'arch-study',
    name: 'Arch Dental Study',
    category: 'health',
    categoryLabel: 'Health & Science',
    type: 'order',
    price: 140,
    availability: 'Made to order',
    lead: 'Ships in 5–7 days',
    image: '/renders/arch-study.jpg',
    tone: '#e2e9e8',
    blurb: 'A dimensional dental reference, printed in matte plaster with crisp anatomy.',
    description:
      'A reference arch for dental studios, printed at high resolution in matte plaster. Supplied from your scan or our standard adult anatomy. Available with a magnetic split for demonstration, and a numbered base for storage.',
    materials: ['Plaster white', 'Stone grey'],
    sizes: ['Standard adult', 'From your scan'],
    dimensions: '8 × 7 cm · magnetic split',
    rating: 5,
    reviewCount: 18,
  },
]

export const projects: Project[] = [
  {
    id: 'maya',
    title: 'A portrait for Maya',
    client: 'Private commission',
    location: 'Brooklyn, NY',
    year: '2026',
    tags: ['Personalised', 'Portrait'],
    filter: 'personal',
    image: '/renders/project-maya.jpg',
    size: 'tall',
    blurb: 'A 24 cm porcelain portrait, made for a 40th birthday from three quiet photographs.',
    story:
      'Maya’s family sent three photographs taken in the same kitchen over a decade. Our sculptor focused on the way she held her head when listening. After one preview and a small adjustment to the jawline, the portrait was printed in 0.06 mm layers and finished by hand. It now sits on the family’s piano, next to the photographs that started it.',
    materials: 'Porcelain, satin finish',
    duration: '17 studio days',
  },
  {
    id: 'wren',
    title: 'The Wren House',
    client: 'Wren Studio',
    location: 'Hudson Valley, NY',
    year: '2025',
    tags: ['Industry', 'Architecture'],
    filter: 'industry',
    image: '/renders/project-wren.jpg',
    size: 'wide',
    blurb: 'A 1:100 sectional model for a courtyard house — 28 printed parts and 46 hours of machine time.',
    story:
      'Wren Studio needed a model that would travel to three client presentations without losing its edges. We split the house into 28 interlocking parts printed at 0.08 mm, assembled them around a hidden magnetic core, and shipped it in a custom foam case. The model now lives in the studio’s library.',
    materials: 'Bone white PLA, matte sealed',
    duration: '3 weeks',
  },
  {
    id: 'noon',
    title: 'Halo for Noon',
    client: 'Noon Coffee',
    location: 'Amsterdam, NL',
    year: '2025',
    tags: ['Home', 'Lighting'],
    filter: 'home',
    image: '/renders/project-noon.jpg',
    size: 'standard',
    blurb: 'Twelve warm halo pendants for a corner café that wanted to feel like a living room.',
    story:
      'Noon asked for lighting that would make a small café feel like a home at dusk. We printed twelve Halo shades in warm ivory, tuned the translucency for a 2700K source, and delivered them in two batches. The café now keeps a spare on the shelf — just in case.',
    materials: 'Translucent ivory, hand-polished',
    duration: '4 weeks',
  },
  {
    id: 'aster',
    title: 'The Aster Collection',
    client: 'Aster Atelier',
    location: 'Milan, IT',
    year: '2026',
    tags: ['Jewellery', 'Collection'],
    filter: 'jewellery',
    image: '/renders/project-aster.jpg',
    size: 'standard',
    blurb: 'A six-piece prototype collection in castable resin, refined over six iterations in a month.',
    story:
      'Aster Atelier came to us with hand-drawn forms that were difficult to fabricate at scale. We modelled and printed the collection in castable resin, refined each iteration with their goldsmith, and handed over production-ready masters. The final rings are now cast in recycled silver and gold.',
    materials: 'Castable resin, silver masters',
    duration: '4 weeks',
  },
  {
    id: 'kite',
    title: 'Kite & Country',
    client: 'Private commission',
    location: 'Portland, OR',
    year: '2024',
    tags: ['Games', 'Tabletop'],
    filter: 'personal',
    image: '/renders/project-kite.jpg',
    size: 'wide',
    blurb: 'A modular tabletop ruin, commissioned as a gift for a game master and now an edition of 50.',
    story:
      'What began as a single tabletop set for a birthday became our most requested collaboration. We refined the nine interlocking pieces for durability, designed a felt-lined travel box, and produced a limited run of fifty sets. Each is numbered under the base.',
    materials: 'Tough resin, dry stone finish',
    duration: '6 weeks',
  },
  {
    id: 'pulse',
    title: 'Pulse, in the field',
    client: 'Fieldwork Robotics',
    location: 'Rotterdam, NL',
    year: '2025',
    tags: ['Tech', 'Prototype'],
    filter: 'industry',
    image: '/renders/project-pulse.jpg',
    size: 'standard',
    blurb: 'A field trial batch of carbon-fibre drone frames, printed and finished in ten days.',
    story:
      'Fieldwork needed twenty frames for a survey season in the polder. We printed their geometry in carbon-fibre nylon, reinforced the motor mounts, and finished every frame by hand. The frames logged over 200 hours of flight with no structural failures. The next run is in design.',
    materials: 'Carbon-fibre nylon, sealed',
    duration: '10 days',
  },
]

export const reviews: Review[] = [
  {
    id: 'maya-r',
    quote:
      'I cried when I opened it. The likeness is uncanny, but it’s also just a beautiful object in its own right. It sits next to the photographs that started it all.',
    name: 'Maya R.',
    location: 'Brooklyn, US',
    project: 'The Portrait · 24 cm, porcelain',
    productId: 'portrait',
    projectId: 'maya',
    rating: 5,
    date: 'August 2026',
    tone: '#eadfd2',
    initials: 'MR',
  },
  {
    id: 'jonas-k',
    quote:
      'They caught a tolerance issue our own CAD team missed. The parts fit the first time, and the surface finish embarrassed the machined prototype.',
    name: 'Jonas K.',
    location: 'Berlin, DE',
    project: 'Custom prototype · Glass-filled nylon',
    rating: 5,
    date: 'July 2026',
    tone: '#e2e4e1',
    initials: 'JK',
  },
  {
    id: 'priya-s',
    quote:
      'Our wedding topper became the thing everyone photographed. It’s now on our shelf, not in a box. That feels like the whole point.',
    name: 'Priya S.',
    location: 'London, UK',
    project: 'Arc Topper · Pearl, personalised',
    productId: 'arc-topper',
    rating: 5,
    date: 'June 2026',
    tone: '#f2e7d7',
    initials: 'PS',
  },
  {
    id: 'elena-marco',
    quote:
      'The Halo lamps changed the whole room. They feel like they were always meant to be there — warm, quiet, and a little otherworldly.',
    name: 'Elena & Marco',
    location: 'Milan, IT',
    project: 'Halo Lamp · Ivory, pair',
    productId: 'halo-lamp',
    projectId: 'noon',
    rating: 5,
    date: 'May 2026',
    tone: '#e9e0d5',
    initials: 'EM',
  },
  {
    id: 'tomas-v',
    quote:
      'Stiffer and lighter than the frame it replaced. You can feel the care in the finish. We’re ordering ten more for the survey team.',
    name: 'Tomas V.',
    location: 'Rotterdam, NL',
    project: 'Pulse Drone Frame · Carbon nylon',
    productId: 'pulse-drone',
    projectId: 'pulse',
    rating: 5,
    date: 'April 2026',
    tone: '#dfe2e0',
    initials: 'TV',
  },
  {
    id: 'amelia-w',
    quote:
      'They captured the exact tilt of her head. It’s her, somehow, in porcelain. My daughter recognised her immediately.',
    name: 'Amelia W.',
    location: 'Brooklyn, US',
    project: 'Pet sculpture · 18 cm, porcelain',
    rating: 5,
    date: 'March 2026',
    tone: '#e8e2d9',
    initials: 'AW',
  },
]

export const finishes: Finish[] = [
  {
    id: 'porcelain',
    name: 'Porcelain',
    note: 'Warm white · satin',
    description: 'An opaque, warm white with a soft satin hand-feel. Our most-loved finish for portraits.',
    swatch: '#f3efe6',
    color: '#f3efe6',
    roughness: 0.34,
    metalness: 0,
    clearcoat: 0.28,
    transmission: 0,
  },
  {
    id: 'sandstone',
    name: 'Sandstone',
    note: 'Mineral · matte',
    description: 'Mineral, matte, and slightly tactile — like cut chalk. Ages beautifully with touch.',
    swatch: '#cdbba4',
    color: '#cdbba4',
    roughness: 0.82,
    metalness: 0,
    clearcoat: 0,
    transmission: 0,
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    note: 'Charcoal · soft-touch',
    description: 'A deep charcoal with a soft-touch, low-sheen finish. Quiet and architectural.',
    swatch: '#2c2b29',
    color: '#2c2b29',
    roughness: 0.58,
    metalness: 0.05,
    clearcoat: 0.12,
    transmission: 0,
  },
  {
    id: 'sage',
    name: 'Sage',
    note: 'Pigmented · satin',
    description: 'A quiet green, pigment through the material rather than painted on top.',
    swatch: '#9da98f',
    color: '#9da98f',
    roughness: 0.46,
    metalness: 0,
    clearcoat: 0.18,
    transmission: 0,
  },
  {
    id: 'terracotta',
    name: 'Terracotta',
    note: 'Clay · dry matte',
    description: 'Earthy clay with a dry, matte surface. Made for plants and objects that live near them.',
    swatch: '#b46246',
    color: '#b46246',
    roughness: 0.9,
    metalness: 0,
    clearcoat: 0,
    transmission: 0,
  },
  {
    id: 'chrome',
    name: 'Chrome',
    note: 'Polished · mirror',
    description: 'Hand-polished and lacquered for a near-mirror finish. For objects meant to catch the light.',
    swatch: '#c9d0d2',
    color: '#c9d0d2',
    roughness: 0.16,
    metalness: 1,
    clearcoat: 0.4,
    transmission: 0,
  },
]

export const portraitSteps = [
  {
    number: '01',
    title: 'Send your photographs',
    copy: 'Three to five clear images, from slightly different angles. Any light, any camera. We’ll guide you if you’re unsure.',
    note: 'About 10 minutes',
  },
  {
    number: '02',
    title: 'We sculpt your likeness',
    copy: 'A studio artist models your portrait and sends a 360° preview. One round of refinements is included.',
    note: '5–7 studio days',
  },
  {
    number: '03',
    title: 'Printed in fine layers',
    copy: 'Your portrait is printed at 0.06 mm, then hand-sanded, sealed, and inspected under raking light.',
    note: '4–6 studio days',
  },
  {
    number: '04',
    title: 'Finished & delivered',
    copy: 'Numbered, wrapped in a felt-lined case, and shipped with tracking. Ready to keep, or to give.',
    note: 'Worldwide delivery',
  },
]

export const customServices = [
  {
    icon: 'scan' as IconName,
    title: '3D scanning',
    copy: 'Capture an object, a face, or a site as a precise digital twin. Up to 0.05 mm resolution.',
  },
  {
    icon: 'model' as IconName,
    title: '3D modelling',
    copy: 'From a sketch, a photograph, or a napkin. Our artists and engineers make it buildable.',
  },
  {
    icon: 'print' as IconName,
    title: 'FDM & resin printing',
    copy: 'Fourteen materials, 0.05–0.4 mm layers. Chosen for strength, feel, or colour.',
  },
  {
    icon: 'finish' as IconName,
    title: 'Finishing & post',
    copy: 'Sanding, vapour smoothing, painting, dyeing, and metal plating. Finished by hand.',
  },
  {
    icon: 'batch' as IconName,
    title: 'Small-batch production',
    copy: 'From one to five thousand. Jigged, quality-checked, packed, and fulfilled.',
  },
  {
    icon: 'review' as IconName,
    title: 'Design review',
    copy: 'A second set of eyes from our engineers before anything goes to the machine.',
  },
]

export const trustItems = [
  { icon: 'star' as IconName, title: '4.9 / 5', copy: 'From 2,480 verified reviews' },
  { icon: 'layers' as IconName, title: '0.06 mm', copy: 'Fine-layer printing in-house' },
  { icon: 'truck' as IconName, title: 'Worldwide', copy: 'Tracked, carbon-neutral delivery' },
  { icon: 'leaf' as IconName, title: 'Circular', copy: 'Recycled materials, closed loop' },
]

export const stats = [
  { value: '9,400+', label: 'objects made' },
  { value: '2,480', label: 'verified reviews' },
  { value: '14 days', label: 'average portrait' },
  { value: '28', label: 'materials & finishes' },
]

export const navLinks = [
  { label: 'Play', href: '#play' },
  { label: 'Portrait Studio', href: '#portrait' },
  { label: 'Custom Printing', href: '#custom' },
  { label: 'Projects', href: '#projects' },
  { label: 'Reviews', href: '#reviews' },
]

export const utilityLinks = [
  { label: 'Custom printing', note: 'Upload a file or start with an idea', href: '#custom' },
  { label: '3D scanning', note: 'Objects, faces, and spaces', href: '#custom' },
  { label: 'Materials & finishes', note: 'Six studio finishes to explore', href: '#materials' },
  { label: 'Trade & wholesale', note: 'For studios, shops, and brands', href: '#custom' },
]
