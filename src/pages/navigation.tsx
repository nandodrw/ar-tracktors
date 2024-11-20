import {LocationContextProvider} from '../context/location-context'
import React from 'react'
import {ArNavigation} from '../components/ar-navigation'

export const Navigation = ({db}: {db: any}) => {
	return (
		<LocationContextProvider>
			<ArNavigation db={db} />
		</LocationContextProvider>
	);
};
