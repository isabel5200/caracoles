import { useState, type FormEvent } from "react";
import type {
  SnailPayChargeRequest,
  SnailPayStatusDetail,
} from "@caracoles/shared";
import { useAuth } from "../hooks/useAuth";
import { waitForLoadingCue } from "../utils/loading";
import { LoadingSpiral } from "./LoadingSpiral";

const messages: Record<SnailPayStatusDetail, string> = {
  accredited: "Recarga aprobada.",
  card_declined: "La tarjeta ficticia fue rechazada.",
  invalid_payment_data: "Revisa los datos de prueba y el monto.",
  unsupported_test_card: "Usa una de las tarjetas ficticias documentadas.",
  balance_limit: "El saldo superaría el límite de esta demostración.",
  gateway_unavailable: "SnailPay no está disponible en este momento.",
};

export function TopUpPanel() {
  const { topUp, user } = useAuth();
  const [amount, setAmount] = useState(100);
  const [cardNumber, setCardNumber] = useState("1234123412341234");
  const [expiration, setExpiration] = useState("12/26");
  const [cvv, setCvv] = useState("543");
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isSafeInteger(Math.round(amount * 100)) ||
      Math.abs(Math.round(amount * 100) / 100 - amount) > 1e-9
    ) {
      setError("Ingresa un monto mayor que cero, con hasta dos decimales.");
      return;
    }
    const payment: SnailPayChargeRequest = {
      card_number: cardNumber.trim(),
      expiration_date: expiration.trim(),
      cvv: cvv.trim(),
      full_name: fullName.trim(),
      transaction_amount: amount,
    };
    setProcessing(true);
    try {
      await waitForLoadingCue();
      const result = await topUp(payment);
      const message = messages[result.status_detail];
      if (result.status === "approved")
        setSuccess(`${message} Referencia ${result.reference}.`);
      else setError(`${message} Referencia ${result.reference}.`);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudo cargar el saldo.",
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <section className="topup-card" aria-labelledby="topup-title">
      <div className="card-heading">
        <div>
          <span className="section-kicker">PASARELA SIMULADA</span>
          <h2 id="topup-title">Carga saldo con SnailPay</h2>
        </div>
        <span className="snailpay-mark" aria-hidden="true">
          🐌
        </span>
      </div>
      <p>
        Usa exclusivamente los datos ficticios de prueba. SnailPay no procesa
        pagos reales.
      </p>
      <form onSubmit={handleSubmit} autoComplete="off">
        <label htmlFor="topup-name">Nombre completo</label>
        <input
          id="topup-name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          disabled={processing}
        />
        <label htmlFor="topup-card">Número de tarjeta ficticia</label>
        <input
          id="topup-card"
          value={cardNumber}
          onChange={(event) => setCardNumber(event.target.value)}
          inputMode="numeric"
          maxLength={16}
          required
          disabled={processing}
        />
        <div className="payment-row">
          <div>
            <label htmlFor="topup-expiration">Vencimiento</label>
            <input
              id="topup-expiration"
              value={expiration}
              onChange={(event) => setExpiration(event.target.value)}
              placeholder="MM/AA"
              maxLength={5}
              required
              disabled={processing}
            />
          </div>
          <div>
            <label htmlFor="topup-cvv">CVV ficticio</label>
            <input
              id="topup-cvv"
              value={cvv}
              onChange={(event) => setCvv(event.target.value)}
              inputMode="numeric"
              maxLength={3}
              required
              disabled={processing}
            />
          </div>
        </div>
        <label htmlFor="topup-amount">Monto a cargar</label>
        <div className="money-input">
          <span>$</span>
          <input
            id="topup-amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            disabled={processing}
          />
          <span>MXN</span>
        </div>
        <div className="amount-presets" aria-label="Montos sugeridos">
          {[100, 250, 500].map((preset) => (
            <button
              key={preset}
              type="button"
              className={amount === preset ? "active" : ""}
              onClick={() => setAmount(preset)}
              disabled={processing}
            >
              ${preset}
            </button>
          ))}
        </div>
        <button
          className="primary-button"
          type="submit"
          disabled={processing}
          aria-busy={processing}
        >
          {processing ? "Procesando recarga…" : "Cargar saldo"}
          {processing ? <LoadingSpiral /> : <span aria-hidden="true">↗</span>}
        </button>
      </form>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="success-message" role="status">
          {success}
        </div>
      )}
      <small className="topup-disclaimer">
        Prueba aprobada: 1234123412341234 · 12/26 · 543. Rechazo:
        0000000000000000 · 12/26 · 000.
      </small>
    </section>
  );
}
