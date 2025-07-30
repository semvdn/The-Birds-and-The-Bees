export function generateLSystem(iterations, rules) {
    let currentString = 'X';
    for (let i = 0; i < iterations; i++) {
        let nextString = '';
        for (const char of currentString) {
            const rule = rules[char];
            if (Array.isArray(rule)) {
                nextString += rule[Math.floor(Math.random() * rule.length)];
            } else {
                nextString += rule || char;
            }
        }
        currentString = nextString;
    }
    return currentString;
}

export function calculateMaxHeight(lSystemString, length, angle) {
    let state = { y: 0, angle: -90 * (Math.PI / 180) };
    let minY = 0;
    const stack = [];
    for (const command of lSystemString) {
        switch (command) {
            case 'F': state.y += length * Math.sin(state.angle); minY = Math.min(minY, state.y); break;
            case '+': state.angle += angle * (Math.PI / 180); break;
            case '-': state.angle -= angle * (Math.PI / 180); break;
            case '[': stack.push({ ...state }); break;
            case ']': state = stack.pop(); break;
        }
    }
    return Math.abs(minY);
}

export function setupPlantData(preset, plantType) {
    let length;
    if (plantType === 'tree') length = 5;
    else if (plantType === 'shrub') length = 4;
    else length = 3;

    const lindenmayerString = generateLSystem(preset.iterations, preset.rules);
    const barkColors = [];
    const baseHex = parseInt(preset.barkColor.slice(1), 16);
    let r_base = (baseHex >> 16) & 0xff, g_base = (baseHex >> 8) & 0xff, b_base = baseHex & 0xff;
    for (const char of lindenmayerString) {
        if (char === 'F') {
            const r = r_base + Math.round((Math.random() - 0.5) * 15), g = g_base + Math.round((Math.random() - 0.5) * 15), b = b_base + Math.round((Math.random() - 0.5) * 15);
            barkColors.push(`rgb(${r},${g},${b})`);
        }
    }
    const unscaledHeight = calculateMaxHeight(lindenmayerString, length, preset.angle);
    return { ...preset, plantType, lindenmayerString, length, unscaledHeight, barkColors, stack: [] };
}