// What the app knows about clothes: categories, every piece type, and the
// text prompt CLIP uses to recognise each one.

export const CATEGORIES = [
  { id: 'top', label: 'Tops', one: 'Top' },
  { id: 'bottom', label: 'Bottoms', one: 'Bottoms' },
  { id: 'outer', label: 'Outerwear', one: 'Outerwear' },
  { id: 'shoes', label: 'Shoes', one: 'Shoes' },
  { id: 'acc', label: 'Accessories', one: 'Accessory' },
];

// warmth: how warm it is (0-4). formal: 0 = gym, 3 = dressed up.
// loud: statement piece (print/pattern), so don't stack two.
export const SUBTYPES = [
  // tops
  { id: 'tee', cat: 'top', label: 'T-shirt', clip: 'a plain t-shirt', warmth: 1, formal: 1 },
  { id: 'graphic-tee', cat: 'top', label: 'Graphic tee', clip: 'a graphic t-shirt with a print', warmth: 1, formal: 0.5, loud: true },
  { id: 'long-sleeve', cat: 'top', label: 'Long sleeve', clip: 'a long sleeve t-shirt', warmth: 1.5, formal: 1 },
  { id: 'polo', cat: 'top', label: 'Polo', clip: 'a polo shirt with a collar', warmth: 1, formal: 2 },
  { id: 'button-up', cat: 'top', label: 'Button-up', clip: 'a button-up collared dress shirt', warmth: 1, formal: 2.5 },
  { id: 'flannel', cat: 'top', label: 'Flannel', clip: 'a plaid flannel shirt', warmth: 1.5, formal: 1, loud: true },
  { id: 'hoodie', cat: 'top', label: 'Hoodie', clip: 'a pullover hoodie sweatshirt with a hood', warmth: 2.5, formal: 0.5 },
  { id: 'sweatshirt', cat: 'top', label: 'Crewneck', clip: 'a crewneck sweatshirt', warmth: 2.2, formal: 1 },
  { id: 'quarter-zip', cat: 'top', label: 'Quarter-zip', clip: 'a quarter-zip pullover sweater', warmth: 2, formal: 2 },
  { id: 'sweater', cat: 'top', label: 'Sweater', clip: 'a knit sweater', warmth: 2.5, formal: 2 },
  { id: 'jersey', cat: 'top', label: 'Jersey', clip: 'a sports jersey', warmth: 1, formal: 0.5 },
  { id: 'tank', cat: 'top', label: 'Tank top', clip: 'a sleeveless tank top', warmth: 0.5, formal: 0 },
  // bottoms
  { id: 'jeans', cat: 'bottom', label: 'Jeans', clip: 'a pair of denim jeans', warmth: 1.5, formal: 1.5 },
  { id: 'cargo', cat: 'bottom', label: 'Cargo pants', clip: 'a pair of cargo pants with side pockets', warmth: 1.5, formal: 1 },
  { id: 'sweatpants', cat: 'bottom', label: 'Sweatpants', clip: 'a pair of sweatpants joggers', warmth: 1.5, formal: 0 },
  { id: 'track-pants', cat: 'bottom', label: 'Track pants', clip: 'a pair of track pants with side stripes', warmth: 1.2, formal: 0.5 },
  { id: 'chinos', cat: 'bottom', label: 'Chinos', clip: 'a pair of chino pants', warmth: 1.5, formal: 2 },
  { id: 'dress-pants', cat: 'bottom', label: 'Dress pants', clip: 'a pair of dress slacks trousers', warmth: 1.5, formal: 3 },
  { id: 'shorts', cat: 'bottom', label: 'Shorts', clip: 'a pair of casual shorts', warmth: 0.5, formal: 1 },
  { id: 'athletic-shorts', cat: 'bottom', label: 'Athletic shorts', clip: 'a pair of basketball athletic shorts', warmth: 0.5, formal: 0 },
  // outerwear
  { id: 'bomber', cat: 'outer', label: 'Bomber', clip: 'a bomber jacket', warmth: 2, formal: 1.5 },
  { id: 'denim-jacket', cat: 'outer', label: 'Denim jacket', clip: 'a denim jean jacket', warmth: 1.5, formal: 1.5 },
  { id: 'puffer', cat: 'outer', label: 'Puffer', clip: 'a quilted puffer jacket', warmth: 3.5, formal: 1 },
  { id: 'varsity', cat: 'outer', label: 'Varsity jacket', clip: 'a varsity letterman jacket', warmth: 2, formal: 1 },
  { id: 'windbreaker', cat: 'outer', label: 'Windbreaker', clip: 'a light windbreaker jacket', warmth: 1, formal: 0.5 },
  { id: 'track-jacket', cat: 'outer', label: 'Track jacket', clip: 'a zip-up track jacket with stripes', warmth: 1.5, formal: 0.5 },
  { id: 'zip-hoodie', cat: 'outer', label: 'Zip hoodie', clip: 'a zip-up hoodie', warmth: 2.5, formal: 0.5 },
  { id: 'fleece', cat: 'outer', label: 'Fleece', clip: 'a fleece jacket', warmth: 2.5, formal: 1 },
  { id: 'coat', cat: 'outer', label: 'Coat', clip: 'a long wool overcoat', warmth: 4, formal: 2.5 },
  { id: 'work-jacket', cat: 'outer', label: 'Work jacket', clip: 'a canvas chore work jacket', warmth: 2.5, formal: 1.5 },
  { id: 'blazer', cat: 'outer', label: 'Blazer', clip: 'a suit blazer jacket', warmth: 1.5, formal: 3 },
  // shoes
  { id: 'sneakers', cat: 'shoes', label: 'Sneakers', clip: 'a pair of sneakers', warmth: 0, formal: 1 },
  { id: 'running', cat: 'shoes', label: 'Running shoes', clip: 'a pair of running shoes', warmth: 0, formal: 0.5 },
  { id: 'high-tops', cat: 'shoes', label: 'High-tops', clip: 'a pair of high top basketball sneakers', warmth: 0, formal: 0.5 },
  { id: 'skate', cat: 'shoes', label: 'Skate shoes', clip: 'a pair of skate shoes', warmth: 0, formal: 0.5 },
  { id: 'boots', cat: 'shoes', label: 'Boots', clip: 'a pair of boots', warmth: 0, formal: 2 },
  { id: 'loafers', cat: 'shoes', label: 'Loafers', clip: 'a pair of leather loafers dress shoes', warmth: 0, formal: 3 },
  { id: 'slides', cat: 'shoes', label: 'Slides', clip: 'a pair of slide sandals', warmth: 0, formal: 0 },
  // accessories
  { id: 'cap', cat: 'acc', label: 'Cap', clip: 'a baseball cap', warmth: 0, formal: 0.5 },
  { id: 'beanie', cat: 'acc', label: 'Beanie', clip: 'a knit beanie hat', warmth: 0.5, formal: 0.5 },
  { id: 'bag', cat: 'acc', label: 'Bag', clip: 'a backpack bag', warmth: 0, formal: 1 },
  { id: 'watch', cat: 'acc', label: 'Watch', clip: 'a wristwatch', warmth: 0, formal: 2 },
  { id: 'sunglasses', cat: 'acc', label: 'Sunglasses', clip: 'a pair of sunglasses', warmth: 0, formal: 1 },
  { id: 'belt', cat: 'acc', label: 'Belt', clip: 'a leather belt', warmth: 0, formal: 2 },
  { id: 'chain', cat: 'acc', label: 'Chain', clip: 'a necklace chain', warmth: 0, formal: 1 },
];

export const SUB = Object.fromEntries(SUBTYPES.map((s) => [s.id, s]));
export const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
export const subsOf = (cat) => SUBTYPES.filter((s) => s.cat === cat);
