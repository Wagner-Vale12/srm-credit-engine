import { formatJson } from "../../utils/formatters";

type JsonViewerProps = {
  value: unknown;
};

export function JsonViewer({ value }: JsonViewerProps) {
  return <pre>{formatJson(value)}</pre>;
}
