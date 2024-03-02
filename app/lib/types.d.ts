export type State = {
  // layers: options
  l: {
    [key: number]: number | null;
  }
  // hasMinted
  hM: boolean;
  // got started
  gS: boolean;
  // is eligible
  iE: boolean;
};

export type LayerSelectionOption = {
  name: string;
  layer: string;
  buttonIndex: number;
  buttonLabel: string;
  file: string | null;
  bigFile?: string;
};