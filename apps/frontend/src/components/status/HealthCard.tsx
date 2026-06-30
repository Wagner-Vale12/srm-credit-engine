import type { ApiHealth } from "../../types";
import { CardHeader } from "../common/CardHeader";
import { JsonViewer } from "../common/JsonViewer";

type HealthCardProps = {
  health: ApiHealth | null;
};

export function HealthCard({ health }: HealthCardProps) {
  return (
    <article className="card">
      <CardHeader
        step="01"
        title="API Health"
        badge={health ? "online" : "offline"}
        badgeVariant={health ? "success" : "default"}
      />
      <JsonViewer value={health} />
    </article>
  );
}
