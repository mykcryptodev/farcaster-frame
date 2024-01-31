type LayerOption = {
  name: string,
  file: string,
  weight: number,
}

export type Layer = {
  name: string,
  probability: number,
  options: LayerOption[]
}

export type MetadataTemplate = {
  image: string,
  name: string,
  external_url: string,
  description: string,
  attributes: {
    trait_type: string,
    value: string | number | boolean
  }[]
}