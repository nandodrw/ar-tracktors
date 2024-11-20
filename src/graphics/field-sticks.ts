import {Camera, GridHelper, LineBasicMaterial, Scene} from 'three'

export class FieldSticks {

	gridSize: number = 10
	gridDivisions: number = 10
	_gridY: number = -1.5
	_lineWidth: number = 1
	_xPositionOffset: number = 0
	_zPositionOffset: number = 0
	private grids: GridHelper[]
	private gridIndexSet: Array<number>
	_camera: Camera | null = null
	private material: LineBasicMaterial
	_colors = [
		0x0efe33,
		0xa7b068,
		0x5d57c3,
		0xb8be39,
		0x340c4f,
		0xbdbb19,
		0xbafc28,
		0xb47c15,
		0x198e5f]

	constructor(currentCoordinate: {latitude: number, longitude: number}, stickCoordinates: {latitude: number, longitude: number}[] = []) {
		this.grids = Array.from({ length: 9 }, () => new GridHelper( this.gridSize, this.gridDivisions ));
		this.material = new LineBasicMaterial({
			color: 0x0000ff,
			linewidth: this._lineWidth,
		});
		this.setMaterial()
		this.gridIndexSet = [0, 1, 2, 3, 4, 5, 6, 7, 8]
		this.positionGrids()
	}

	private positionGrids() {
		if (!this._camera) {
			return;
		}

		const positionX = this._camera.position.x;
		const positionZ = this._camera.position.z;

		this.gridIndexSet.forEach((gridIndex, index) => {

			switch (index) {
				case 0:
					this.grids[gridIndex].position.x = positionX - this.gridSize
					this.grids[gridIndex].position.z = positionZ - this.gridSize
					break
				case 1:
					this.grids[gridIndex].position.x = positionX
					this.grids[gridIndex].position.z = positionZ - this.gridSize
					break
				case 2:
					this.grids[gridIndex].position.x = positionX + this.gridSize
					this.grids[gridIndex].position.z = positionZ - this.gridSize
					break
				case 3:
					this.grids[gridIndex].position.x = positionX - this.gridSize
					this.grids[gridIndex].position.z = positionZ
					break
				case 4:
					this.grids[gridIndex].position.x = positionX
					this.grids[gridIndex].position.z = positionZ
					break
				case 5:
					this.grids[gridIndex].position.x = positionX + this.gridSize
					this.grids[gridIndex].position.z = positionZ
					break
				case 6:
					this.grids[gridIndex].position.x = positionX - this.gridSize
					this.grids[gridIndex].position.z = positionZ + this.gridSize
					break
				case 7:
					this.grids[gridIndex].position.x = positionX
					this.grids[gridIndex].position.z = positionZ + this.gridSize
					break
				case 8:
					this.grids[gridIndex].position.x = positionX + this.gridSize
					this.grids[gridIndex].position.z = positionZ + this.gridSize
					break
			}
		})
	}

	private setMaterial() {
		this.grids.forEach((grid, index) => {
			const material = new LineBasicMaterial({
				color: this._colors[index],
				linewidth: this._lineWidth,
			});
			grid.material = material
		});
	}

	private placeGridInitialPosition() {
		this.grids.forEach((grid) => grid.position.y = this._gridY)
	}

	set gridY(value: number) {
		this._gridY = value;
		this.placeGridInitialPosition()
	}

	get gridY() {
		return this._gridY;
	}

	set lineWidth(value: number) {
		this._lineWidth = value;
		this.setMaterial()
	}

	get lineWidth() {
		return this._lineWidth;
	}

	loadToScene(scene: Scene, camera: Camera) {
		this.grids.forEach((grid) => scene.add(grid))
		this.placeGridInitialPosition()
		this._camera = camera
	}

	moveGrid(x: number, z: number) {

		this._xPositionOffset += x
		this._zPositionOffset += z

		this.grids.forEach((grid) => {
			grid.position.x += x
			grid.position.z += z
		})

		this.rearrangeGrid()
	}

	private rearrangeGrid() {
		const currentGridIndex = this.getCurrentGridPositionIndex() as number
		if (currentGridIndex !== 4) {
			const temp = this.gridIndexSet[4]
			this.gridIndexSet[4] = this.gridIndexSet[currentGridIndex]
			this.gridIndexSet[currentGridIndex] = temp
			this.positionGrids()
		}
	}

	get currentGripPositionIndex() {
		return this.getCurrentGridPositionIndex() || 0
	}

	get xOffset() {
		return this._xPositionOffset
	}

	get zOffset() {
		return this._zPositionOffset
	}

	private getCurrentGridPositionIndex() {
		if (!this._camera) {
			return -1
		}

		for (let i = 0; i < this.gridIndexSet.length; i++) {
			const grid = this.grids[this.gridIndexSet[i]]

			if (grid.position.x  - this.gridSize / 2 < this._camera.position.x && grid.position.x  + this.gridSize / 2 > this._camera.position.x) {
				if (grid.position.z  - this.gridSize / 2 < this._camera.position.z && grid.position.z  + this.gridSize / 2 > this._camera.position.z) {
					return i
				}
			}
		}
		return -1
	}
}