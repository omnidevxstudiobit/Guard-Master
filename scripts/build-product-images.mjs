/**
 * Product image pipeline — "Products 2026" → public/images/products/.
 *
 * The client's asset drop is 347 files of mixed provenance: iPhone HEICs, raw
 * DNGs, 4032×3024 site photography, 640×640 product renders and a tail of
 * 200×200 catalogue thumbnails lifted from fencing-supplier.com. None of that
 * is shippable as-is, and the folder itself is not web-servable (spaces in
 * every path, and `public/` is what Astro copies).
 *
 * Two hard constraints shaped this:
 *
 * 1. **HEIC and DNG are skipped, not converted.** 190 HEICs + 7 DNGs can't be
 *    decoded in this environment — sharp's bundled libheif (1.23.0) rejects
 *    every one of them with "Number of references in iref box (48) exceeds the
 *    security limits of 16", and Windows has no HEIF codec installed to fall
 *    back on. Rather than ship a half-broken converter, the manifest below
 *    only names files that actually decode. Export the HEICs to JPG and they
 *    can be added to the manifest without touching this script.
 *
 * 2. **Nothing is ever upscaled.** Source widths run from 200px to 9600px, so
 *    a fixed width ladder would blow the 200×200 catalogue thumbnails up to
 *    mush. Each image emits only the ladder widths at or below its own real
 *    width (plus at least one variant, always), and the true output width is
 *    recorded in the generated index so `srcset` never lies about what it's
 *    offering.
 *
 * Run with `npm run images`. Output is deterministic and idempotent — the
 * generated webp files and src/data/product-images.json are committed, so a
 * deploy never needs the (large, mostly-undecodable) source folder.
 */

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const SOURCE_DIR = path.join(ROOT, 'Products 2026');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'products');
const INDEX_FILE = path.join(ROOT, 'src', 'data', 'product-images.json');

/** Widths we're willing to emit. Filtered per-image against the real source. */
const WIDTH_LADDER = [480, 960, 1600];

/**
 * The curated set. Every entry was reviewed on a contact sheet before being
 * listed — the folders also contain duplicates, blurry frames and off-topic
 * shots that deliberately aren't here.
 *
 * `alt` is written per image and is real descriptive text, not the filename
 * echoed back: these end up as the only description a screen-reader user gets
 * of the product.
 */
const GROUPS = [
  {
    slug: 'clear-view-fencing-panels',
    folder: 'Clear View Panels',
    images: [
      /* Engineering renders lead. The first entry in each group is what the
         homepage range section shows at full size, so these are ordered
         render-first, photography-after — a studio render of the actual
         assembly reads as product, where a yard snapshot reads as inventory. */
      {
        file: '56.png',
        alt: 'Render of a galvanised clear view post, 358 mesh panel and shark-tooth spike topping',
      },
      {
        file: '30.png',
        alt: 'Three-quarter render of a clear view fence run with spike topping',
      },
      {
        file: '4.png',
        alt: 'Close render of the welded junction where horizontal and vertical 358 wires meet',
      },
      {
        file: '34.png',
        alt: 'Render of a clear view post finished with a moulded solar cap',
      },
      { file: '32.png', alt: 'Render of two capped posts carrying a run of clear view mesh' },
      { file: '31.png', alt: 'Render of a single clear view post, isolated on white' },
      {
        file: 'clear-view-high-security-anti-climb-fencing-panels-plain-galv.jpeg',
        alt: 'Plain galvanised clear view 358 mesh panels running at an angle along a perimeter',
      },
      { file: '57.png', alt: 'Galvanised clear view panel fixed to a post, seen head-on' },
      { file: '58.png', alt: 'Black powder-coated clear view panels with spike topping' },
      {
        file: 'clear-view-fencing-commercial-property-high-security-fencing-600x442.jpg',
        alt: 'Clear view fencing securing a commercial property boundary',
      },
      {
        file: 'clear-view-fencing-private-property-powder-coated-option-anti-climb-600x442.jpg',
        alt: 'Powder-coated anti-climb clear view fencing on a private property',
      },
      { file: '52.png', alt: 'Black clear view fencing along a landscaped office boundary' },
      {
        file: 'clear-view-fencing-anti-cut-anti-climb-high-visibility.jpg',
        alt: 'Anti-cut, anti-climb clear view fencing with full visibility through the mesh',
      },
      { file: '8.png', alt: 'Clear view fence line curving away under open sky' },
      { file: '17.png', alt: 'Flat sample of 358 welded mesh showing the narrow aperture pattern' },
    ],
  },
  {
    slug: 'clear-view-fencing-posts',
    folder: 'Clear View Posts',
    images: [
      { file: '34.PNG', alt: 'Clear view fencing post with a moulded black cap' },
      { file: '35.PNG', alt: 'Two clear view posts side by side, silver and graphite cap options' },
      { file: '32.PNG', alt: 'Clear view posts with solar caps carrying a run of mesh panels' },
      { file: '57.PNG', alt: 'Galvanised post with a clear view panel clamped to it' },
      { file: 'IMG_5074.JPG', alt: 'Close-up of a solar post cap with its integrated light' },
      {
        file: 'IMG_4742.JPG',
        alt: 'Finished post samples on display in the Guard Master factory',
      },
      {
        file: '5BFCF5B7-B5C7-4941-AB24-88A74B552970.JPG',
        alt: 'Stacked galvanised post profiles fresh off the line',
      },
      {
        file: 'D8E851DE-F908-4F6B-8961-F6FBB22056B7.JPG',
        alt: 'Bundled square post stock in the factory yard',
      },
    ],
  },
  {
    slug: 'razor-wire-mesh',
    folder: 'Razor Wire Mesh',
    images: [
      { file: '42.PNG', alt: 'Welded razor wire mesh sheet showing the diamond blade pattern' },
      {
        file: 'razor-wire-mesh-sheet-high-density-200x200.png',
        alt: 'High-density razor wire mesh sheet, isolated against black',
      },
      {
        file: 'razor-wire-mesh-sheet-standard-density-200x200.png',
        alt: 'Standard-density razor wire mesh sheet, isolated against black',
      },
      {
        file: 'welded-razor-wire-mesh-200x200.jpeg',
        alt: 'Razor wire blade profile called out against a welded mesh sheet',
      },
      {
        file: 'razor-wire-mesh-standard-density-reinforced-with-concertina-coils-as-topping (1).jpg',
        alt: 'Standard-density razor wire mesh fence reinforced with concertina coil topping',
      },
      {
        file: 'DJI_20250930_103020_472.JPG',
        alt: 'Looking down the barrel of a coiled razor wire mesh roll',
      },
      { file: 'IMG_6277.JPG', alt: 'Razor wire mesh rolls stacked in the factory yard' },
      { file: 'IMG_6282.JPG', alt: 'Galvanised razor wire mesh rolls ready for dispatch' },
      { file: '1.png', alt: 'Installers setting a razor wire mesh panel onto its post' },
      {
        file: 'razor-wire-mesh-post-installation-layout.gif',
        alt: 'Technical drawing of the razor wire mesh post installation layout',
      },
      {
        file: 'razor-wire-mesh-post-installation-solutions.gif',
        alt: 'Technical drawing of light and heavy main post details for razor wire mesh',
      },
    ],
  },
  {
    slug: 'razor-wire-mesh-posts',
    folder: 'Razor Wire Mesh Posts',
    images: [
      {
        file: 'razor-wire-mesh-installation-posts.jpg',
        alt: 'Galvanised corner post carrying razor wire mesh on a site perimeter',
      },
      {
        file: '069cfd6a-a505-41c1-85d8-1b7024b10a6f.JPG',
        alt: 'Racked galvanised round posts in the Guard Master warehouse',
      },
      {
        file: '34f80cda-3177-4d2b-bb99-f3ca71a81c57.JPG',
        alt: 'Close-up of a round post with its pre-punched fixing slots',
      },
      { file: 'DJI_20250930_103133_031.JPG', alt: 'Bundled post stock stacked in the yard' },
      {
        file: 'razor-wire-mesh-main-post-min-200x200.jpg',
        alt: 'Razor wire mesh main post with a pointed driven end',
      },
      {
        file: 'stay-posts-razor-wire-and-diamond-mesh-fencing-min-200x200.jpg',
        alt: 'Three stay posts for razor wire and diamond mesh fencing',
      },
      {
        file: 'main-posts-support-razor-wire-mesh-diamond-fencing-min-200x200.jpg',
        alt: 'Bundle of main support posts for razor wire and diamond mesh fencing',
      },
    ],
  },
  {
    slug: 'concertina-razor-wire',
    folder: 'Concertina Coil',
    images: [
      {
        file: 'concertina-razor-wire-coils-diameter-980mm (1).jpeg',
        alt: 'A 980 mm diameter concertina razor wire coil stretched out along a warehouse floor',
      },
      { file: '45.png', alt: 'Stacked concertina razor wire coils in the factory yard' },
      { file: '44.png', alt: 'Concertina razor wire coils awaiting dispatch' },
      { file: '54.png', alt: 'Concertina coils being loaded onto a delivery truck' },
      {
        file: 'clear-view-fencing-reinforced-concertina-coils-as-topping-200x200.jpeg',
        alt: 'Clear view fencing reinforced with concertina coil topping',
      },
      {
        file: 'clear-view-fencing-reinforced-with-4-rows-concertina-coils-200x200.jpeg',
        alt: 'Perimeter fence reinforced with four rows of concertina coils',
      },
      {
        file: 'concertina-razor-wire-blade-profiles-options-200x200.jpg',
        alt: 'The range of concertina razor wire blade profiles',
      },
      {
        file: 'concertina-razor-wire-coils-as-topping-200x200.jpeg',
        alt: 'Concertina razor wire installed as a wall topping',
      },
    ],
  },
  {
    slug: 'temporary-fencing',
    folder: 'Temp Fencing',
    images: [
      {
        file: 'IMG_6996.PNG',
        alt: 'Free-standing temporary fence panels braced across a yard gateway',
      },
      {
        file: 'IMG_6995.PNG',
        alt: 'Temporary fencing panels standing at a site entrance beside a bakkie',
      },
      { file: 'IMG_6936.JPG', alt: 'Temporary fence panels stacked on a pallet in the factory' },
      { file: 'IMG_6994.PNG', alt: 'A temporary fence panel being assembled on site' },
      { file: 'IMG_6918.JPG', alt: 'Wrapped and palletised temporary fencing ready for dispatch' },
      { file: 'IMG_6916.JPG', alt: 'Temporary fencing pallets being checked before loading' },
    ],
  },

  /* Fixtures and accessories have no folder of their own — every clamp, spike
     and cap shot lives inside the panels/posts drops. Pulled out here so the
     two existing product pages have real photography of their own subject
     rather than borrowing a generic panel shot. */
  {
    slug: 'fixtures-and-screws',
    folder: 'Clear View Panels',
    images: [
      {
        file: 'clear-view-fence-100mmx12.7mm-clamps-powder-coating-black-200x200.jpg',
        alt: 'Black powder-coated 100 × 12.7 mm clear view fence clamp',
      },
      {
        file: 'clear-view-fence-76mmx50mm-clamps-powder-coating-black-200x200.jpeg',
        alt: 'Black powder-coated 76 × 50 mm clear view fence clamp',
      },
      { file: '30.png', alt: 'Clamp and fixing detail where a panel meets its post' },
      { file: '32.png', alt: 'Post caps and clamps fixing a run of clear view mesh' },
    ],
  },
  {
    slug: 'accessories',
    folder: 'Clear View Panels',
    images: [
      {
        file: 'clear-view-fence-anti-climb-reinforced-with-shark-tooth-spikes-600x442.jpeg',
        alt: 'Clear view fencing reinforced with shark-tooth spike topping',
      },
      {
        file: 'sliding-gate-galvanized-clear-view-mesh-filling-reinforced-intermedia-spikes-600x442.jpeg',
        alt: 'Galvanised sliding gate with clear view mesh infill and spike reinforcement',
      },
      {
        file: 'clear-view-anti-climb-fencing-panels-powder-coated-intermedia-spikes-200x200.jpeg',
        alt: 'Powder-coated clear view panels with intermediate anti-climb spikes',
      },
      { file: '36.png', alt: 'Spike-topped clear view fencing seen against a treeline' },
    ],
  },
  {
    slug: 'accessories-caps',
    folder: 'Clear View Posts',
    images: [
      { file: 'IMG_5084.JPG', alt: 'Solar post cap mounted on a clear view post' },
      { file: 'IMG_5053.JPG', alt: 'Detail of the solar cap lens and housing' },
    ],
  },

  /* Real site photography, used by the home page's project feature and the
     sector rail. Kept as its own group rather than filed under a product —
     these are perimeters, not SKUs. */
  {
    slug: 'projects',
    folder: 'Clear View Panels',
    images: [
      { file: '14.png', alt: 'Clear view fencing around a petrochemical processing plant' },
      { file: '15.png', alt: 'Perimeter fencing along a container port with gantry cranes behind' },
      { file: '25.png', alt: 'Fence line with electric-fence topping running across open veld' },
      { file: '26.png', alt: 'Perimeter fencing following a service road through open country' },
      { file: '33.png', alt: 'Clear view fencing securing a marina and its moorings' },
      { file: '51.png', alt: 'Clear view fencing around a school playground' },
      { file: '24.png', alt: 'Fence line tracking a ridge across remote terrain' },
      {
        file: 'DJI_20240903_084123_886.JPG',
        alt: 'Aerial view of a completed clear view perimeter installation',
      },
    ],
  },
];

const slugifyBase = (file) =>
  path
    .basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const run = async () => {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source folder not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const index = {};
  let written = 0;
  let missing = 0;

  for (const group of GROUPS) {
    const entries = [];

    for (const image of group.images) {
      const src = path.join(SOURCE_DIR, group.folder, image.file);
      if (!fs.existsSync(src)) {
        console.warn(`  missing: ${group.folder}/${image.file}`);
        missing += 1;
        continue;
      }

      let meta;
      try {
        meta = await sharp(src, { animated: false }).metadata();
      } catch (error) {
        console.warn(
          `  undecodable: ${group.folder}/${image.file} — ${error.message.split('\n')[0]}`,
        );
        missing += 1;
        continue;
      }

      const outDir = path.join(OUT_DIR, group.slug);
      fs.mkdirSync(outDir, { recursive: true });

      const base = slugifyBase(image.file);
      // Never upscale: only ladder rungs at or below the true source width.
      // Then top the list up with the source's own width (capped at the
      // ladder's ceiling) whenever the next rung up is out of reach — without
      // this, a 950px source would emit a lone 480px variant and silently
      // throw away half the resolution it actually had.
      const ceiling = Math.min(meta.width, WIDTH_LADDER[WIDTH_LADDER.length - 1]);
      const targets = WIDTH_LADDER.filter((w) => w <= meta.width);
      if (targets[targets.length - 1] !== ceiling) targets.push(ceiling);

      const variants = [];
      for (const width of targets) {
        const outFile = path.join(outDir, `${base}-${width}.webp`);
        const info = await sharp(src, { animated: false })
          .rotate() // honour EXIF orientation before resizing
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(outFile);
        variants.push({
          src: `/images/products/${group.slug}/${base}-${width}.webp`,
          width: info.width,
          height: info.height,
        });
        written += 1;
      }

      const largest = variants[variants.length - 1];
      entries.push({
        id: base,
        alt: image.alt,
        src: largest.src,
        width: largest.width,
        height: largest.height,
        srcset: variants.map((v) => `${v.src} ${v.width}w`).join(', '),
      });
    }

    index[group.slug] = entries;
    console.log(`${group.slug}: ${entries.length} images`);
  }

  fs.writeFileSync(INDEX_FILE, `${JSON.stringify(index, null, 2)}\n`);
  console.log(
    `\n${written} files written · ${missing} skipped · index → ${path.relative(ROOT, INDEX_FILE)}`,
  );
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
