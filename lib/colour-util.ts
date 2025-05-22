// Utility function to calculate contrasting colors
export const getContrastingColors = (bgColor: string) => {
    // Safety check - if bgColor is undefined or null, default to white
    if (!bgColor) {
        return {
            buttonBgColor: 'rgba(204, 204, 204, 0.7)',
            buttonTextColor: '#000000'
        };
    }

    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
        try {
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            const formattedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : {r: 255, g: 255, b: 255}; // Default to white if parsing fails
        } catch (error) {
            console.error('Error parsing hex color:', error);
            return {r: 255, g: 255, b: 255}; // Default to white on error
        }
    };

    // Calculate luminance
    const getLuminance = (rgb: { r: number, g: number, b: number }) => {
        return 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
    };

    // Parse the background color
    let rgb;
    try {
        if (bgColor.startsWith('#')) {
            rgb = hexToRgb(bgColor);
        } else if (bgColor.startsWith('rgb')) {
            // Basic parsing for rgb/rgba format
            const matches = bgColor.match(/\d+/g);
            if (matches && matches.length >= 3) {
                rgb = {
                    r: parseInt(matches[0], 10),
                    g: parseInt(matches[1], 10),
                    b: parseInt(matches[2], 10)
                };
            } else {
                rgb = {r: 255, g: 255, b: 255}; // Default to white
            }
        } else {
            // Handle named colors by using a default approach
            // For simplicity, we'll use a basic mapping for common colors
            const namedColors: { [key: string]: { r: number, g: number, b: number } } = {
                'white': {r: 255, g: 255, b: 255},
                'black': {r: 0, g: 0, b: 0},
                'red': {r: 255, g: 0, b: 0},
                'green': {r: 0, g: 128, b: 0},
                'blue': {r: 0, g: 0, b: 255},
                'grey': {r: 128, g: 128, b: 128},
                'gray': {r: 128, g: 128, b: 128},
            };
            rgb = namedColors[bgColor.toLowerCase()] || {r: 255, g: 255, b: 255};
        }
    } catch (error) {
        console.error('Error parsing color:', error);
        rgb = {r: 255, g: 255, b: 255}; // Default to white on error
    }

    const luminance = getLuminance(rgb);

    // Determine if background is light or dark
    const isLight = luminance > 128;

    // Create a button background color that's a shade of the background
    const buttonBgColor = isLight ?
        `rgba(${rgb.r * 0.8}, ${rgb.g * 0.8}, ${rgb.b * 0.8}, 0.7)` :
        `rgba(${Math.min(rgb.r + 50, 255)}, ${Math.min(rgb.g + 50, 255)}, ${Math.min(rgb.b + 50, 255)}, 0.7)`;

    // Choose text color based on button background
    const buttonTextColor = isLight ? '#000000' : '#ffffff';

    return {buttonBgColor, buttonTextColor};
};