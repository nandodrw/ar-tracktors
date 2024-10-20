import {
	BoxGeometry,
	CylinderGeometry,
	HemisphereLight,
	Mesh,
	MeshPhongMaterial,
	PerspectiveCamera,
	Scene,
	WebGLRenderer
} from 'three'
import {useCallback, useEffect, useRef, useState} from 'react'
import {ARButton} from 'three/examples/jsm/webxr/ARButton'
import GUI from 'lil-gui'
import {MovementGrid} from '../graphics/movement-grid'

export const ArNavigation = () => {
	const canvas = useRef<HTMLCanvasElement>(null);

	const scene = useRef<Scene>(new Scene());
	const camera = useRef<PerspectiveCamera>(new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 11 ));
	const renderer = useRef<WebGLRenderer>(new WebGLRenderer( { antialias: true, alpha: true, canvas: canvas.current !== null ? canvas.current : undefined  } ));
	const light = useRef<HemisphereLight>(new HemisphereLight( 0xffffff, 0xbbbbff, 1 ))
	const geometry = useRef(new CylinderGeometry( 0, 0.05, 0.2, 32 ).rotateX( Math.PI / 2 ));
	const controller = useRef(renderer.current.xr.getController( 0 ));

	const cubeGeometry = useRef(new BoxGeometry( 0.5, 0.5, 0.5, ));
	const cubeMaterial = useRef(new MeshPhongMaterial( { color: 0xffffff * Math.random(), wireframe: true } ))
	const cubeMesh = useRef(new Mesh( cubeGeometry.current, cubeMaterial.current ));

	const movementGrid = useRef(new MovementGrid())

	const gui = useRef<GUI | null>(null)

	const onSelect = useCallback(() => {
		const material = new MeshPhongMaterial( { color: 0xffffff * Math.random() } );
		const mesh = new Mesh( geometry.current, material );
		mesh.position.set( 0, 0, - 0.3 ).applyMatrix4( controller.current.matrixWorld );
		mesh.quaternion.setFromRotationMatrix( controller.current.matrixWorld );
		scene.current.add( mesh );
	}, [])

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

		renderer.current.setPixelRatio( window.devicePixelRatio );
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

	return (<canvas ref={canvas} style={{width: '100vw', height: '100vh'}} />)
}