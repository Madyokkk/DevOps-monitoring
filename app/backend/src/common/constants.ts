export const KZ_PHONE_REGEX = /^\+7\s?7\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
export const KZ_PHONE_REGEX_LOOSE = /^\+7\s?7\d{9}$/;

export const ORDER_STATUS_KZ = {
  NEW: 'Жаңа',
  PAID: 'Төленді',
  PREPARING: 'Дайындалып жатыр',
  DELIVERING: 'Жолда',
  DELIVERED: 'Жеткізілді',
  CANCELLED: 'Болдырылмады',
} as const;

export const PAYMENT_METHODS_KZ = {
  CASH: 'Қолма-қол',
  CARD_DEMO: 'Картамен (демо)',
} as const;
