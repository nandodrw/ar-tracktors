import {
	HemisphereLight,
	PerspectiveCamera,
	Scene,
	WebGLRenderer
} from 'three'
import {useCallback, useEffect, useRef, useState} from 'react'
import {ARButton} from 'three/examples/jsm/webxr/ARButton'
import GUI from 'lil-gui'
import {MovementGrid} from '../graphics/movement-grid'
import {collection, getDocs} from 'firebase/firestore'
import {coordinatesToGrid} from '../utils/geo-location'

export const ArNavigation = ({db}: {db: any}) => {

	const [stickCoordinates, setStickCoordinates] = useState<{ lat: number, lon: number }[]>([])
	const [stickPlaneCoordinates, setStickPlaneCoordinates] = useState<{ x: number, y: number }[]>([])
	const [gpsLocation, setGpsLocation] = useState<{ lat: number; lon: number } | null>(null);
	const [deviceOrientation, setDeviceOrientation] = useState<{ alpha: number | null, beta: number | null, gamma: number | null }>({ alpha: null, beta: null, gamma: null });

	useEffect(() => {
		if (db) {
			getDocs(collection(db, "stick-location"))
				.then((querySnapshot) => {
					const coordinates: { lat: number, lon: number }[] =[]
					querySnapshot.docs.forEach((doc) => {
						coordinates.push(doc.data() as { lat: number, lon: number })
					})
					setStickCoordinates(coordinates)
				})
				.catch((error) => {
					console.error("Error getting documents: ", error);
				});
		}
	}, [db])

	const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent) => {
		setDeviceOrientation({
			alpha: event.alpha,
			beta: event.beta,
			gamma: event.gamma,
		});
	}, []);

	const getGpsLocation = useCallback(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					setGpsLocation({ lat: latitude, lon: longitude });
				},
				(error) => {
					console.error('Error getting GPS location: ', error);
				},
				{ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
			);
		} else {
			console.error('Geolocation is not supported by this browser.');
		}
	}, []);

	useEffect(() => {
		getGpsLocation();
		// Add event listener for device orientation
		window.addEventListener('deviceorientation', handleDeviceOrientation, true);

		// Cleanup
		return () => {
			window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
		};
	}, [getGpsLocation, handleDeviceOrientation])

	useEffect(() => {
		if (gpsLocation && deviceOrientation?.alpha && stickCoordinates.length > 0) {
			coordinatesToGrid(gpsLocation, deviceOrientation.alpha, stickCoordinates)
		}
	}, [gpsLocation, deviceOrientation, stickCoordinates])

	const canvas = useRef<HTMLCanvasElement>(null);
	const scene = useRef<Scene>(new Scene());
	const camera = useRef<PerspectiveCamera>(new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 11 ));
	const renderer = useRef<WebGLRenderer>(new WebGLRenderer( { antialias: true, alpha: true, canvas: canvas.current !== null ? canvas.current : undefined  } ));
	const light = useRef<HemisphereLight>(new HemisphereLight( 0xffffff, 0xbbbbff, 1 ))
	const controller = useRef(renderer.current.xr.getController( 0 ));

	const movementGrid = useRef(new MovementGrid())

	const gui = useRef<GUI | null>(null)

	const onWindowResize = useCallback(() => {
		camera.current.aspect = window.innerWidth / window.innerHeight;
		camera.current.updateProjectionMatrix();
		renderer.current.setSize( window.innerWidth, window.innerHeight );
	}, [])

	const render = useCallback(() => {
		renderer.current.render( scene.current, camera.current );
	}, [])

	useEffect(() => {
		//scene.current.add(cubeMesh.current);

		movementGrid.current.loadToScene(scene.current, camera.current)

		light.current.position.set( 0.5, 1, 0.25 );
		scene.current.add( light.current );

		renderer.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.current.setSize( window.innerWidth, window.innerHeight );
		renderer.current.xr.enabled = true;

		// To review
		document.body.appendChild( ARButton.createButton( renderer.current, {
			optionalFeatures: ['dom-overlay', 'dom-overlay-for-handheld-ar'],
			domOverlay: {root: document.body}
		}));

		//controller.current.addEventListener( 'select', onSelect );
		scene.current.add( controller.current );

		onWindowResize()

		camera.current.position.z = 3;

		window.addEventListener( 'resize', onWindowResize, false );

		renderer.current.setAnimationLoop( render );

		initializeUi()
		// eslint-disable-next-line
	}, [])

	const [uiInitialized, setUiInitialized] = useState(false);

	const initializeUi = useCallback(() => {
		if (!uiInitialized) {
			gui.current = new GUI();
			gui.current.add(movementGrid.current, 'gridY').min(-5).max(5).step(0.01)
			gui.current.add(movementGrid.current, 'lineWidth').min(1).max(10).step(0.01)

			const gridMover = {
				goLeft() {
					movementGrid.current.moveGrid(0.1, 0)
					gui.current?.load(movementGrid.current)
				},
				goRight() {
					movementGrid.current.moveGrid(-0.1, 0)
				},
				goBackward() {
					movementGrid.current.moveGrid(0, -0.1)
				},
				goForward()  {
					movementGrid.current.moveGrid(0, 0.1)
				},
				alertValues() {
					alert(`
						currentIndex: ${movementGrid.current.currentGripPositionIndex}
						xOffset: ${movementGrid.current.xOffset}
						zOffset: ${movementGrid.current.zOffset}
					`)
				}
			}

			gui.current.add(gridMover, 'goForward')
			gui.current.add(gridMover, 'goBackward')
			gui.current.add(gridMover, 'goLeft')
			gui.current.add(gridMover, 'goRight')
			gui.current.add(gridMover, 'alertValues')

			setUiInitialized(true)
		}
		// eslint-disable-next-line
	}, []);

	return (
		<>
			<div style={{
				color: 'white',
				position: 'absolute',
				top: 0,
				left: 0,
				width: '400px',
				height: '250px',
				background: 'rgba(0, 0, 0, 0.8)',
			}}>
				<h2>Device Position</h2>
				<div>Lat {gpsLocation?.lat}</div>
				<div>Lon {gpsLocation?.lon}</div>
				<h2>Device Orientation</h2>
				<div>Lat {deviceOrientation?.alpha}</div>
				<div>Beta {deviceOrientation?.beta}</div>
				<div>Gamma {deviceOrientation?.gamma}</div>
			</div>
			<canvas ref={canvas} style={{width: '100vw', height: '100vh'}}/>
		</>

	)
}


