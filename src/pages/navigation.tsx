import {LocationContextProvider} from '../context/location-context'
import React from 'react'
import {ArNavigation} from '../components/ar-navigation'


export const Navigation: React.FC = () => {
	return (
		<LocationContextProvider>
			<ArNavigation/>
		</LocationContextProvider>
	);
};
