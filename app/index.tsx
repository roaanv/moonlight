import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import Animated, {runOnJS, useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import ColorPicker, {
    BrightnessSlider,
    HueCircular,
    Panel1,
    Swatches
} from 'reanimated-color-picker';
import { Stack, useNavigation } from "expo-router";
import type { ColorFormatsObject } from 'reanimated-color-picker';

// Utility function to calculate contrasting colors
const getContrastingColors = (bgColor: string) => {
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
            } : { r: 255, g: 255, b: 255 }; // Default to white if parsing fails
        } catch (error) {
            console.error('Error parsing hex color:', error);
            return { r: 255, g: 255, b: 255 }; // Default to white on error
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
                rgb = { r: 255, g: 255, b: 255 }; // Default to white
            }
        } else {
            // Handle named colors by using a default approach
            // For simplicity, we'll use a basic mapping for common colors
            const namedColors: { [key: string]: { r: number, g: number, b: number } } = {
                'white': { r: 255, g: 255, b: 255 },
                'black': { r: 0, g: 0, b: 0 },
                'red': { r: 255, g: 0, b: 0 },
                'green': { r: 0, g: 128, b: 0 },
                'blue': { r: 0, g: 0, b: 255 },
                'grey': { r: 128, g: 128, b: 128 },
                'gray': { r: 128, g: 128, b: 128 },
            };
            rgb = namedColors[bgColor.toLowerCase()] || { r: 255, g: 255, b: 255 };
        }
    } catch (error) {
        console.error('Error parsing color:', error);
        rgb = { r: 255, g: 255, b: 255 }; // Default to white on error
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

    return { buttonBgColor, buttonTextColor };
};

export default function Index() {
    const [showModal, setShowModal] = useState(false);
    const [bgColor, setBgColor] = useState('white');
    const [buttonBgColor, setButtonBgColor] = useState('rgba(204, 204, 204, 0.7)'); // Initial button background color
    const [buttonTextColor, setButtonTextColor] = useState('#000000'); // Initial button text color

    const customSwatches = [
        'white',
        'grey',
        'black',
        'red',
        'green',
        'blue',
    ];

    const selectedColor = useSharedValue(customSwatches[0]);
    const backgroundColorStyle = useAnimatedStyle(() => ({ backgroundColor: selectedColor.get() }));

    // Load saved color on app start
    useEffect(() => {
        const loadSavedColor = async () => {
            const savedColor = await AsyncStorage.getItem('selectedColor');
            if (savedColor) {
                selectedColor.set(savedColor);
                setBgColor(savedColor);
                const { buttonBgColor, buttonTextColor } = getContrastingColors(savedColor);
                setButtonBgColor(buttonBgColor);
                setButtonTextColor(buttonTextColor);
            }
        };
        loadSavedColor();
    }, []);

    const saveColor = async (color: string) => {
        try {
            await AsyncStorage.setItem('selectedColor', color);
        } catch (error: unknown) {
            console.error('Error saving color:', error);
        }
    };

    const updateColours = (colour: string) => {
        saveColor(colour);
        setBgColor(colour);
        const { buttonBgColor, buttonTextColor } = getContrastingColors(colour);
        setButtonBgColor(buttonBgColor);
        setButtonTextColor(buttonTextColor);
    }

    const onColorSelect = (color: ColorFormatsObject) => {
        'worklet';
        const newColor = color.hex;
        selectedColor.set(newColor);
        runOnJS(updateColours)(newColor);
    };

    return (
    <View style={[styles.app, { backgroundColor: bgColor }]}>
        <Stack.Screen
            options={{
                headerShown: false,
                title: "foo"
        }}
            />
        <Pressable 
            style={[styles.openButton, { backgroundColor: buttonBgColor }]} 
            onPress={() => setShowModal(true)}
        >
            <Text style={{ color: buttonTextColor, fontWeight: 'bold', textAlign: 'center' }}>Change Colour</Text>
        </Pressable>

        <Modal onRequestClose={() => setShowModal(false)} visible={showModal} animationType='slide'>
            <Animated.View style={[styles.container, backgroundColorStyle]}>
                <View style={[styles.pickerContainer, { backgroundColor: buttonBgColor }]}>
                    <ColorPicker value={selectedColor.get()} sliderThickness={20} thumbSize={24} onChange={onColorSelect} boundedThumb>
                        <HueCircular containerStyle={[styles.hueContainer, { backgroundColor: buttonBgColor }]} thumbShape='pill'>
                            <Panel1 style={[styles.panelStyle, { backgroundColor: buttonBgColor }]} />
                        </HueCircular>
                        <BrightnessSlider style={styles.brightnessContainer}/>
                        <Swatches style={styles.swatchesContainer} swatchStyle={styles.swatchStyle} colors={customSwatches} />
                    </ColorPicker>
                </View>

                <Pressable style={[styles.closeButton, { backgroundColor: buttonBgColor }]} onPress={() => setShowModal(false)}>
                    <Text style={{ color: buttonTextColor, fontWeight: 'bold' }}>Close</Text>
                </Pressable>
            </Animated.View>
        </Modal>
    </View>
 );
}


const styles = StyleSheet.create({
    app: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        backgroundColor: 'orange',
    },
    pickerContainer: {
        alignSelf: 'center',
        width: 300,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,

        elevation: 10,
    },
    hueContainer: {
        justifyContent: 'center',
    },
    panelStyle: {
        width: '70%',
        height: '70%',
        alignSelf: 'center',
        borderRadius: 16,
    },
    previewTxtContainer: {
        paddingTop: 20,
        marginTop: 20,
        borderTopWidth: 1,
        borderColor: '#bebdbe',
    },
    swatchesContainer: {
        paddingTop: 20,
        marginTop: 20,
        borderTopWidth: 1,
        borderColor: '#bebdbe',
        alignItems: 'center',
        flexWrap: 'nowrap',
        gap: 10,
    },
    brightnessContainer: {
        marginTop: 10,
    },
    swatchStyle: {
        borderRadius: 20,
        height: 30,
        width: 30,
        margin: 0,
        marginBottom: 0,
        marginHorizontal: 0,
        marginVertical: 0,
    },
    openButton: {
        position: 'absolute',
        bottom: 40,
        width: '60%',
        borderRadius: 30,
        paddingHorizontal: 40,
        paddingVertical: 10,
        alignSelf: 'center',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        bottom: 40,
        borderRadius: 20,
        paddingHorizontal: 40,
        paddingVertical: 10,
        alignSelf: 'center',
        backgroundColor: '#fff',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
});
