"use client";

import { useEffect, useRef, useState } from "react";
import { QR_IMAGE_URL, siteConfig, tariff } from "@/lib/config";
import { calcPrice, formatSom, sheetWord } from "@/lib/pricing";
import { editWhatsAppNumber, validateOrder, ORDER_LIMITS, type OrderFields, type OrderErrors } from "@/lib/order";
import Icon from "./Icon";
import { saveOrder, type SavedOrder } from "@/lib/order-history";
import { RECEIPT_ACCEPT, receiptFileError, receiptSignatureMatches } from "@/lib/receipt";

type Stage = "application" | "payment" | "complete";
const PAYMENT_WAIT_SECONDS = 30;

function AnimatedPrice({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const currentValue = useRef(value);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = currentValue.current;
    const end = value;
    const duration = 600; // milliseconds
    const startTime = Date.now();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = motion.matches ? 1 : Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeOut);
      currentValue.current = current;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value]);

  return <><span aria-hidden="true">{new Intl.NumberFormat("ru-RU").format(displayValue)}</span><span className="sr-only">{new Intl.NumberFormat("ru-RU").format(value)}</span></>;
}

export default function OrderForm() {
  const [stage, setStage] = useState<Stage>("application");
  const [values, setValues] = useState<OrderFields>({ topic: "", name: "", phone: "+996 ", sheets: "10", comment: "" });
  const [urgent, setUrgent] = useState(false);
  const [errors, setErrors] = useState<OrderErrors>({});
  const [orderNumber, setOrderNumber] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [sending, setSending] = useState(false);
  const [historyWarning, setHistoryWarning] = useState("");
  const [proof, setProof] = useState<{ file: File; url: string } | null>(null);
  const [proofError, setProofError] = useState("");
  const [checkingProof, setCheckingProof] = useState(false);
  const proofSelection = useRef(0);
  const proofInput = useRef<HTMLInputElement>(null);
  const sendingLock = useRef(false);
  const submission = useRef({ signature: "", id: "" });
  const [paymentWait, setPaymentWait] = useState(PAYMENT_WAIT_SECONDS);
  const paymentDeadline = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const stageTitle = useRef<HTMLHeadingElement>(null);
  const initialStage = useRef(true);
  const count = Number(values.sheets);
  const validCount = values.sheets.trim() !== "" && Number.isInteger(count) && count >= siteConfig.minSheets && count <= siteConfig.maxSheets;
  const base = validCount ? calcPrice(count, false, tariff) : null;
  const total = validCount ? calcPrice(count, urgent, tariff) : null;
  const surcharge = base === null ? null : base * (tariff.rushMultiplier - 1);

  useEffect(() => {
    return () => { if (proof) URL.revokeObjectURL(proof.url); };
  }, [proof]);

  async function selectProof(file: File | null) {
    const selection = ++proofSelection.current;
    setProof(null);
    setProofError("");
    setStorageError("");
    const error = receiptFileError(file);
    if (error || !file) { setProofError(error ?? "Добавьте чек."); setCheckingProof(false); return; }
    setCheckingProof(true);
    try {
      const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
      if (selection !== proofSelection.current) return;
      if (!receiptSignatureMatches(header, file.type)) throw new Error("Выберите настоящий файл JPG, PNG или WebP.");
      setProof({ file, url: URL.createObjectURL(file) });
    } catch {
      if (selection === proofSelection.current) setProofError("Не удалось прочитать изображение. Выберите другое фото чека.");
    } finally {
      if (selection === proofSelection.current) setCheckingProof(false);
    }
  }

  function removeProof() {
    proofSelection.current++;
    setProof(null);
    setProofError("");
    setCheckingProof(false);
    if (proofInput.current) proofInput.current.value = "";
  }

  useEffect(() => {
    if (initialStage.current) { initialStage.current = false; return; }
    stageTitle.current?.focus();
  }, [stage]);

  useEffect(() => {
    if (stage !== "payment") return;
    // Use elapsed time so switching tabs does not extend the countdown.
    const update = () => setPaymentWait(Math.max(0, Math.ceil((paymentDeadline.current - Date.now()) / 1000)));
    const timer = window.setInterval(update, 250);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, [stage]);

  function change(field: keyof OrderFields, value: string) {
    setValues(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: undefined }));
  }

  function updatePhone(raw: string, cursor: number) {
    const result = editWhatsAppNumber(raw, cursor);
    change("phone", "+996 " + result.value);
    requestAnimationFrame(() => {
      if (document.activeElement === phoneRef.current) phoneRef.current?.setSelectionRange(result.caret, result.caret);
    });
  }

  async function completeOrder() {
    if (total === null || stage !== "payment" || paymentWait > 0 || sendingLock.current || !proof || checkingProof) return;
    sendingLock.current = true;
    setSending(true);
    setStorageError("");
    try {
      const payload = { ...values, number: orderNumber, urgent };
      const digest = await crypto.subtle.digest("SHA-256", await proof.file.arrayBuffer());
      const proofHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
      const signature = JSON.stringify(payload) + proofHash;
      if (submission.current.signature !== signature) submission.current = { signature, id: crypto.randomUUID() };
      const form = new FormData();
      form.set("order", JSON.stringify({ ...payload, requestId: submission.current.id }));
      form.set("receipt", proof.file);
      const response = await fetch("/api/orders", {
        method: "POST", body: form,
        signal: AbortSignal.timeout(45000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Не удалось отправить заявку. Попробуйте ещё раз.");
      const receipt = result.order as SavedOrder;
      if (!receipt || receipt.number !== orderNumber || receipt.status !== "sent" || receipt.demo !== false) throw new Error("Не удалось подтвердить отправку. Повторите попытку.");
      try {
        saveOrder(window.localStorage, receipt);
        setHistoryWarning("");
      } catch {
        // Delivery already succeeded: a storage failure must not prompt another Telegram message.
        setHistoryWarning("Заявка отправлена, но браузер не сохранил историю. Запишите номер заказа.");
      }
      setStage("complete");
      setProof(null);
    } catch (error) {
      setStorageError(error instanceof Error && error.name !== "TimeoutError" && error.name !== "TypeError" && error.name !== "SyntaxError" ? error.message : "Нет подтверждения отправки. Проверьте интернет и повторите попытку — данные заявки сохранены на странице.");
    } finally {
      sendingLock.current = false;
      setSending(false);
    }
  }

  function adjustCount(delta: number) {
    const current = Number.isFinite(count) ? Math.trunc(count) : siteConfig.minSheets;
    change("sheets", String(Math.min(siteConfig.maxSheets, Math.max(siteConfig.minSheets, current + delta))));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validateOrder(values, siteConfig.minSheets, siteConfig.maxSheets);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>('[name="' + first + '"]')?.focus();
      return;
    }
    // Stable display number; requestId separately identifies delivery retries.
    if (!orderNumber) setOrderNumber(String(10000000 + crypto.getRandomValues(new Uint32Array(1))[0] % 90000000));
    paymentDeadline.current = Date.now() + PAYMENT_WAIT_SECONDS * 1000;
    setPaymentWait(PAYMENT_WAIT_SECONDS);
    setStage("payment");
  }

  function fieldError(field: keyof OrderErrors) {
    return errors[field] ? <p className="checkout-error" id={field + "-error"}>{errors[field]}</p> : null;
  }
  function bindings(field: keyof OrderErrors, hint?: string) {
    return { "aria-invalid": Boolean(errors[field]), "aria-describedby": [hint, errors[field] ? field + "-error" : ""].filter(Boolean).join(" ") || undefined };
  }

  return <section className="checkout" aria-label="Оформление заказа">
    <ol className="checkout-progress" aria-label="Этапы заказа">
      <li className={stage === "application" ? "active" : "done"} aria-current={stage === "application" ? "step" : undefined}>
        <span className="progress-number">{stage === "application" ? "1" : <Icon name="check"/>}</span>
        <span>Заявка</span>
      </li>
      <li className="progress-connector" aria-hidden="true"/>
      <li className={stage === "payment" ? "active" : stage === "complete" ? "done" : ""} aria-current={stage === "payment" ? "step" : undefined}>
        <span className="progress-number">{stage === "complete" ? <Icon name="check"/> : "2"}</span>
        <span>Оплата</span>
      </li>
    </ol>
    <h1 className="checkout-heading">Оставь заявку сегодня — завтра забери конспект.</h1>
    

    {stage === "application" && <form key="application" className="checkout-panel checkout-stage" ref={formRef} noValidate onSubmit={submit}>
      <h2 ref={stageTitle} tabIndex={-1} className="checkout-stage-title">Заявка</h2>
      <div className="checkout-field">
        <label htmlFor="topic">Тема или предмет <span>*</span></label>
        <input id="topic" name="topic" placeholder="Например, история Кыргызстана: Великий шёлковый путь" value={values.topic} onChange={e => change("topic", e.target.value)} maxLength={ORDER_LIMITS.topic} required {...bindings("topic")}/>
        {fieldError("topic")}
      </div>
      <div className="checkout-row">
        <div className="checkout-field">
          <label htmlFor="name">Имя <span>*</span></label>
          <input id="name" name="name" autoComplete="given-name" placeholder="Как вас зовут?" value={values.name} onChange={e => change("name", e.target.value)} maxLength={ORDER_LIMITS.name} required {...bindings("name")}/>
          {fieldError("name")}
        </div>
        <div className="checkout-field">
          <label htmlFor="phone">Номер WhatsApp <span>*</span></label>
          <div className="phone-input">
            <span className="phone-prefix" aria-hidden="true">+996</span>
            <input ref={phoneRef} id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="XXX XXX XXX" value={values.phone.slice(5)} onChange={e => updatePhone(e.target.value, e.target.selectionStart ?? e.target.value.length)} onKeyDown={e => {
              if ((e.key !== "Backspace" && e.key !== "Delete") || e.ctrlKey || e.metaKey || e.altKey) return;
              const input = e.currentTarget;
              if (input.selectionStart !== input.selectionEnd) return;
              const position = input.selectionStart ?? 0;
              const digits = input.value.replace(/\D/g, "");
              const before = input.value.slice(0, position).replace(/\D/g, "").length;
              const index = e.key === "Backspace" ? before - 1 : before;
              e.preventDefault();
              if (index < 0 || index >= digits.length) return;
              updatePhone(digits.slice(0, index) + digits.slice(index + 1), index);
            }} required {...bindings("phone", "phone-hint")}/>
          </div>
          <p id="phone-hint" className="checkout-hint">+996 XXX XXX XXX</p>
          {fieldError("phone")}
        </div>
      </div>
      <div className="checkout-field">
        <label htmlFor="sheets">Количество листов <span>*</span></label>
        <div className="sheet-counter">
          <button type="button" aria-label="Уменьшить количество листов" onClick={() => adjustCount(-1)} disabled={validCount && count <= siteConfig.minSheets}>−</button>
          <input id="sheets" name="sheets" type="number" inputMode="numeric" min={siteConfig.minSheets} max={siteConfig.maxSheets} step="1" value={values.sheets} onChange={e => change("sheets", e.target.value)} required {...bindings("sheets", "sheet-hint")}/>
          <button type="button" aria-label="Увеличить количество листов" onClick={() => adjustCount(1)} disabled={validCount && count >= siteConfig.maxSheets}>+</button>
        </div>
        <div className="sheet-presets" role="group" aria-label="Быстрый выбор количества листов">
          {[5, 10, 15, 20].map(amount => <button key={amount} type="button" aria-pressed={count === amount} onClick={() => change("sheets", String(amount))}>{amount}</button>)}
        </div>
        <p id="sheet-hint" className="checkout-hint">{siteConfig.sheetDescription}</p>
        {fieldError("sheets")}
      </div>
      <label className="checkout-urgent">
        <span><strong>Нужно срочно</strong><small>Стоимость ×{tariff.rushMultiplier}</small></span>
        <span className="urgent-surcharge">{surcharge === null ? "Укажите объём" : "+ " + formatSom(surcharge)}</span>
        <input type="checkbox" role="switch" checked={urgent} onChange={e => setUrgent(e.target.checked)}/>
        <span className="switch-track" aria-hidden="true"/>
      </label>
      <p className="checkout-price" aria-live="polite" aria-atomic="true">{total === null ? "Укажите от 1 до 100 целых листов" : count + " " + sheetWord(count) + " — "}<span className="price-highlight">{total !== null && <AnimatedPrice value={total} />} {total !== null && "сом"}</span></p>
      <div className="checkout-field">
        <label htmlFor="comment">Комментарий <span className="checkout-optional">необязательно</span></label>
        <textarea id="comment" name="comment" rows={3} maxLength={ORDER_LIMITS.comment} placeholder="Срок, требования или пожелания" value={values.comment} onChange={e => change("comment", e.target.value)}/>
      </div>
      <p className="checkout-error" role="alert">{Object.values(errors).some(Boolean) ? "Проверьте отмеченные поля." : ""}</p>
      <button type="submit" className="button checkout-primary">Перейти к оплате <Icon name="arrow"/></button>
    </form>}

    {stage === "payment" && <div key="payment" className="checkout-panel checkout-stage">
      <div className="payment-title-row"><h2 ref={stageTitle} tabIndex={-1} className="checkout-stage-title">Оплата</h2><button className="edit-order" type="button" disabled={sending} onClick={() => setStage("application")}>Изменить</button></div>
      <dl className="order-summary">
        <div><dt>Тема</dt><dd>{values.topic.trim()}</dd></div>
        <div><dt>Количество</dt><dd>{count} {sheetWord(count)}</dd></div>
        <div><dt>Режим</dt><dd>{urgent ? "Срочный" : "Обычный"}</dd></div>
        <div><dt>Имя</dt><dd>{values.name.trim()}</dd></div>
      </dl>
      <div className="payment-reference"><strong>Заказ №{orderNumber}</strong></div>
      <div className="checkout-total"><span className="checkout-hint">К оплате</span><p><strong><AnimatedPrice value={total ?? 0} /></strong><span>сом</span></p></div>
      <div className="checkout-qr">
        {QR_IMAGE_URL && !imageFailed ?
          // eslint-disable-next-line @next/next/no-img-element
          <img src={QR_IMAGE_URL} alt="QR-код для оплаты заказа" width={240} height={240} onError={() => setImageFailed(true)}/> :
          <div className="checkout-qr-placeholder"><Icon name="qr"/><strong>QR для оплаты</strong><span>{imageFailed ? "Не удалось загрузить QR" : "Скоро появится здесь"}</span></div>}
      </div>
      {siteConfig.paymentRecipient && <p className="checkout-payment-note">Получатель: {siteConfig.paymentRecipient}</p>}
      <div className="receipt-upload">
        <label htmlFor="receipt">Фото или скриншот чека <span>*</span></label>
        <p id="receipt-help" className="checkout-hint">JPG, PNG или WebP, до 3 МБ. Чек отправится вместе с заявкой.</p>
        <input ref={proofInput} id="receipt" type="file" accept={RECEIPT_ACCEPT} disabled={sending || checkingProof} aria-required="true" aria-invalid={Boolean(proofError)} aria-describedby={"receipt-help" + (proofError ? " receipt-error" : "")} onChange={e => { const file = e.target.files?.[0]; if (file) void selectProof(file); }}/>
        {checkingProof && <p className="checkout-hint" role="status">Проверяем изображение…</p>}
        {proof && <div className="receipt-preview" key={proof.url}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={proof.url} alt="Предпросмотр прикреплённого чека" onError={() => { removeProof(); setProofError("Изображение повреждено. Выберите другое фото чека."); }}/>
          <div><p className="receipt-added" role="status"><Icon name="check"/>Чек добавлен</p><p>{proof.file.name}</p><span>{(proof.file.size / 1024 / 1024).toFixed(2)} МБ</span><button type="button" disabled={sending} onClick={removeProof}>Удалить чек</button></div>
        </div>}
        {proofError && <p id="receipt-error" className="checkout-error" role="alert">{proofError}</p>}
      </div>
      <button type="button" className="button checkout-primary" onClick={completeOrder} disabled={paymentWait > 0 || sending || !proof || checkingProof} aria-busy={sending} aria-describedby="payment-wait-status">{sending ? "Отправляем заявку и чек…" : paymentWait > 0 ? `Я оплатил(а) · ${paymentWait} с` : "Я оплатил(а) — отправить заявку"}</button>
      <p id="payment-wait-status" className="checkout-payment-note" role="status">{!proof ? "Добавьте чек, чтобы отправить заявку." : paymentWait > 0 ? "Чек добавлен. Кнопка станет доступна после окончания отсчёта." : "Чек добавлен — можно отправить заявку."}</p>
      <p className="checkout-error" role="alert">{storageError}</p>
      <p className="checkout-payment-note">Далее свяжемся с вами в WhatsApp</p>
    </div>}

    {stage === "complete" && <div key="complete" className="checkout-panel checkout-stage checkout-complete">
      <span className="complete-icon"><Icon name="check"/></span>
      <h2 ref={stageTitle} tabIndex={-1} className="checkout-stage-title">Заявка отправлена</h2>
      <p className="complete-number">Заказ №{orderNumber}</p>
      <p>Мы свяжемся с вами в WhatsApp в ближайшее время</p>
      <p className="checkout-hint">{historyWarning || "Заказ сохранён в этом браузере и доступен в разделе «Мои заказы»."}</p>
      <a className="button checkout-primary" href="/orders">Мои заказы</a>
    </div>}
  </section>;
}
