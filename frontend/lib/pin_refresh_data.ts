let pinChanged = true;

export function setPinChanged(value: boolean) {
  pinChanged = value;
}

export function getPinChanged() {
  return pinChanged;
}

export default function quietWarning() {}