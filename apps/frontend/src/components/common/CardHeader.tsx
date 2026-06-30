type CardHeaderProps = {
  step: string;
  title: string;
  badge?: string;
  badgeVariant?: "default" | "success";
};

export function CardHeader({
  step,
  title,
  badge,
  badgeVariant = "default",
}: CardHeaderProps) {
  return (
    <div className="card-header">
      <div>
        <span className="step">{step}</span>
        <h2>{title}</h2>
      </div>
      {badge ? (
        <span className={`badge${badgeVariant === "success" ? " success" : ""}`}>
          {badge}
        </span>
      ) : null}
    </div>
  );
}
