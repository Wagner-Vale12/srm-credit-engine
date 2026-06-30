import type { Currency } from "../../types";
import { CardHeader } from "../common/CardHeader";

type CurrenciesCardProps = {
  currencies: Currency[];
};

export function CurrenciesCard({ currencies }: CurrenciesCardProps) {
  return (
    <article className="card">
      <CardHeader
        step="02"
        title="Currencies"
        badge={`${currencies.length} currencies`}
      />
      <div className="currency-list">
        {currencies.map((currency) => (
          <div key={currency.code} className="currency-item">
            <strong>{currency.code}</strong>
            <span>{currency.name ?? "Currency"}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
