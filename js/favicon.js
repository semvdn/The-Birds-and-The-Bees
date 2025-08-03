import { PARENT_PRESETS, BIRD_GENES } from './presets.js';
import { drawBirdModel } from './boids/drawing.js';

/**
 * Generates a favicon using the Kingfisher palette and the Starling beak, 
 * then adds it to the document head.
 */
export function generateFavicon() {
    // 1. Find the required presets
    const kingfisherPreset = PARENT_PRESETS.find(p => p.name === "Kingfisher");
    const starlingPreset = PARENT_PRESETS.find(p => p.name === "Starling");

    if (!kingfisherPreset || !starlingPreset) {
        console.error("Could not find required presets to generate favicon.");
        return;
    }

    // 2. Build a dummy bird object with the desired genetic mix
    const bodyVertices = BIRD_GENES.BODY_SHAPES[starlingPreset.genes.baseBeak.body].vertices;
    const dummyBird = {
        genes: {
            palette: kingfisherPreset.genes.palette, // Kingfisher colors
            bodyVertices: bodyVertices,
            beakVertices: starlingPreset.genes.baseBeak.vertices, // Starling beak shape
            tailVertices: kingfisherPreset.genes.baseTail.vertices(bodyVertices) // Kingfisher tail
        },
        isAlive: true, // Needed for palette logic in drawBirdModel
        state: 'HUNTING'
    };

    // 3. Create an off-screen canvas to draw the icon
    const iconSize = 64; // Draw at a higher resolution, browser will scale it down
    const canvas = document.createElement('canvas');
    canvas.width = iconSize;
    canvas.height = iconSize;
    const ctx = canvas.getContext('2d');

    // 4. Position and scale the bird model to fit nicely in the icon
    ctx.save();
    ctx.translate(iconSize / 2, iconSize / 2); // Center the drawing origin
    const scale = 10; // A good scale for a 64x64 canvas
    ctx.scale(scale, -scale); // Use the same Y-flip as the main renderer
    
    // Nudge the bird to the right to ensure the beak is fully visible.
    ctx.translate(2, 0); 
    
    // Draw the bird
    drawBirdModel(ctx, dummyBird);
    ctx.restore();

    // 5. Create the <link> element for the favicon
    const link = document.createElement('link');
    link.type = 'image/x-icon'; // Standard type for .ico, but image/png is widely supported
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL('image/png'); // Convert canvas to a PNG image

    // 6. Add the new favicon link to the document's head
    document.getElementsByTagName('head')[0].appendChild(link);
}