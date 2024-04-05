export type Garbage = {
  id: string,
  x: number,
  y: number,
  mass: number,
  canPack: boolean,
}

export type GarbageCollection = {
  [key: string]: Garbage[]
}   

export type Ship = {
  capacityX: number,
  capacityY: number,
  fuelUsed: number,
  garbage: GarbageCollection,
}

export type Route = {
    to: string,
    cost: number,
}

export type Planet = {
  name: string,
  routes: Route[],
}