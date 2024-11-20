import {Camera, CylinderGeometry, GridHelper, LineBasicMaterial, Mesh, MeshBasicMaterial, Scene} from 'three'

export class FieldSticks {

	private sticks: any[]
	_camera: Camera | null = null
	private material: MeshBasicMaterial
	private geometry: CylinderGeometry

	constructor(stickCoordinates: {x: number, y: number}[] = []) {
		this.geometry = new CylinderGeometry(0.3, 0.3, 1.5, 10)
		this.material = new MeshBasicMaterial( {color: 0xffff00} )
		this.sticks = stickCoordinates.map((stickCoordinate) => {
			const mesh = new Mesh(this.geometry, this.material);
			mesh.position.set(stickCoordinate.x, 0, stickCoordinate.y)
			return mesh
		})
	}

	loadToScene(scene: Scene, camera: Camera) {
		this.sticks.forEach((stick) => scene.add(stick))
		this._camera = camera
	}
}