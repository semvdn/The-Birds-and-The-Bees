# Bird Appearance Mechanics

The visual appearance of each bird in the simulation is not random; it is determined by a set of "genes" that are inherited, blended, and mutated across generations. This genetic system is defined in `presets.js` and implemented in `main.js`.

## Genetic Components (`BIRD_GENES`)

A bird's appearance is defined by a combination of shapes and colors.

1.  **Body Shapes:** These are predefined sets of vertices that form the main body of the bird. The simulation includes a `STANDARD` and `CRACKER` body type.

2.  **Beak & Tail Shapes:**
    -   **Beaks** are also sets of vertices. Each beak shape is designed to connect seamlessly to a specific body shape.
    -   **Tails** are defined as *functions*. A tail function takes the bird's body vertices as input and calculates the correct tail vertices, guaranteeing that the tail always connects perfectly to the body, regardless of how the body shape evolves.

3.  **Color Palettes:** These are objects that map specific body parts (e.g., `head_crest`, `wing_top`) to hexadecimal color codes. The simulation includes several predefined palettes like `CLASSIC` and `EARTHY`.

## Inheritance and Blending (`determineInheritance` function)

When two birds reproduce, their offspring's appearance is a blend of their parents' genes.

1.  **Shape Interpolation:** An offspring's body, beak, and tail vertices are not simply chosen from one parent. Instead, they are calculated by **interpolating** between the vertex positions of parent 1 and parent 2. A random `weight` determines the influence of each parent, allowing for an infinite spectrum of shapes between the two parents.

2.  **Color Blending:** The offspring's color palette is created by taking each color from the parents' palettes (e.g., the `wing_top` color) and computationally blending them to find the average color.

## Drawing the Bird Model

The final appearance is rendered in the `drawBirdModel` function (`drawing.js`):

1.  The bird's geometry is defined as a series of closed polygons (e.g., `head_crest`, `wing_bottom`).
2.  Each polygon is drawn using the vertices from the bird's genetic shape data.
3.  The polygon is filled with the corresponding color from the bird's genetic color palette.
4.  The entire composite shape is then scaled and rotated to match the bird's velocity, making it face its direction of travel.

This system allows for a rich and visually diverse population of birds, where every individual can be subtly or dramatically unique.
