import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from "react";
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import type {ColorFormatsObject} from 'reanimated-color-picker';
import ColorPicker, {BrightnessSlider, Panel3, Swatches} from 'reanimated-color-picker';
import {Stack} from "expo-router";
import {getContrastingColors} from "@/lib/colour-util";

export default function Index() {
    const [showModal, setShowModal] = useState(false);
    const [bgColor, setBgColor] = useState('white');
    const [buttonBgColor, setButtonBgColor] = useState('rgba(204, 204, 204, 0.7)'); // Initial button background color
    const [buttonTextColor, setButtonTextColor] = useState('#000000'); // Initial button text color
    const [showFrontControls, setShowFrontControls] = useState(false); // State to control front controls visibility

    const customSwatches = [
        'white',
        '#999999',
        '#777777',
        '#555555',
        '#333333',
        '#111111',
    ];

    const selectedColor = useSharedValue(customSwatches[0]);
    const frontControlsOpacity = useSharedValue(0);
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

    // Function to show front controls with animation
    const showControls = () => {
        setShowFrontControls(true);
        frontControlsOpacity.value = withTiming(1, { duration: 300 });
    };

    // Function to hide front controls with animation
    const hideControls = () => {
        frontControlsOpacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(setShowFrontControls)(false);
        });
    };

    // Handle background press
    const handleBackgroundPress = () => {
        if (showFrontControls) {
            hideControls();
        }
    };

    // Handle background long press
    const handleBackgroundLongPress = () => {
        if (!showFrontControls) {
            showControls();
        }
    };

    const hideModal = () => {
        setShowModal(false);
        if (showFrontControls) {
            runOnJS(setShowFrontControls)(false);
        }
    }

    return (
    <Pressable 
        style={[styles.app, { backgroundColor: bgColor }]}
        onPress={handleBackgroundPress}
        onLongPress={handleBackgroundLongPress}
    >
        <Stack.Screen
            options={{
                headerShown: false,
                title: "foo"
        }}
            />

        {showFrontControls && <Animated.View style={[backgroundColorStyle, styles.frontControlsContainer]}>

            <View style={[styles.frontPickerContainer, { backgroundColor: buttonBgColor }]}>
                <Pressable
                    onPress={() => setShowModal(true)}
                    style={styles.paletteButton}
                >
                    <MaterialCommunityIcons
                        name="palette"
                        size={24}
                        color={buttonTextColor}
                        style={{ alignSelf: 'center' }}
                    />
                </Pressable>

                <ColorPicker 
                    style={{ flex: 1 }}
                    value={selectedColor.get()} 
                    sliderThickness={20} 
                    thumbSize={24} 
                    onChange={onColorSelect} 
                    boundedThumb
                >
                    <BrightnessSlider style={styles.frontBrightnessContainer} adaptSpectrum={true}/>
                </ColorPicker>
            </View>
        </Animated.View> }

        <Modal onRequestClose={() => setShowModal(false)} visible={showModal} animationType='slide'>
            <Animated.View style={[styles.modalContainer, backgroundColorStyle]}>
                <View style={[styles.pickerContainer, { backgroundColor: buttonBgColor }]}>
                    <ColorPicker style={{ flex: 0 }} value={selectedColor.get()} sliderThickness={20} thumbSize={24} onChange={onColorSelect} boundedThumb>
                        <Panel3 style={[styles.panelStyle, { backgroundColor: buttonBgColor }]} centerChannel={"saturation"}  />
                        <BrightnessSlider style={styles.brightnessContainer} adaptSpectrum={true}/>
                        <Swatches style={styles.swatchesContainer} swatchStyle={styles.swatchStyle} colors={customSwatches} />
                    </ColorPicker>
                </View>

                <Pressable style={[styles.closeButton, { backgroundColor: buttonBgColor }]} onPress={hideModal}>
                    <Text style={{ color: buttonTextColor, fontWeight: 'bold' }}>Close</Text>
                </Pressable>
            </Animated.View>
        </Modal>
    </Pressable>
 );
}


const styles = StyleSheet.create({
    app: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
    },
    pickerContainer: {
        alignSelf: 'center',
        width: '80%',
        flexShrink: 1,
        flexGrow: 0,
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
    frontPickerContainer: {
        flex: 1,
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        elevation: 10,
    },
    hueContainer: {
        justifyContent: 'center',
    },
    panelStyle: {
        // width: '50%',
        // height: '50%',
        // alignSelf: 'center',
        // borderRadius: 16,
    },
    previewTxtContainer: {
        paddingTop: 20,
        marginTop: 20,
        borderTopWidth: 1,
        borderColor: '#bebdbe',
    },
    swatchesContainer: {
        paddingTop: 10,
        marginTop: 10,
        borderTopWidth: 1,
        borderColor: '#bebdbe',
        alignItems: 'center',
        flexWrap: 'nowrap',
        gap: 10,
    },
    brightnessContainer: {
        marginTop: 10,
    },
    frontBrightnessContainer: {
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
    frontControlsContainer: {
        position: 'absolute',
        bottom: 40,
        left: '50%',
        transform: [{ translateX: '-50%' }],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: '80%',
    },
    sliderWrapper: {
        flex: 1,
    },
    iconButton: {
        width: 50,
        height: 50,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconButtonOri: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',

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
    paletteButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
});
