export const selectFilterHandler = (
  input: string,
  option: {
    label: string;
    value: string;
  }
) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
