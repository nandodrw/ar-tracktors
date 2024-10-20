import React, {useState} from 'react'

interface Coordinates {
	latitude: number;
	longitude: number;
}

interface LocationContextType {
	currentCoordinates: Coordinates;
	setCurrentCoordinates: React.Dispatch<React.SetStateAction<Coordinates>>;
	orientation: number;
	setOrientation: React.Dispatch<React.SetStateAction<number>>;
}

const defaultValue: LocationContextType = {
	currentCoordinates: { latitude: 0, longitude: 0 },
	setCurrentCoordinates: () => {},
	orientation: 0,
	setOrientation: () => {},
};

export const LocationContext = React.createContext(defaultValue);

interface LocationContextProviderProps {
	children: React.ReactNode;
}

export const LocationContextProvider = ({children}: LocationContextProviderProps) => {
	// height accuracy coordinates
	const [currentCoordinates, setCurrentCoordinates] = useState({latitude: 0, longitude: 0});

	// degrees from the north
	const [orientation, setOrientation] = useState(0);
	
	return (
        <LocationContext.Provider value={{currentCoordinates, setCurrentCoordinates, orientation, setOrientation}}>
            {children}
        </LocationContext.Provider>
    );
}