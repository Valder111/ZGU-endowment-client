import { FundMark } from '@/assets/svg/fund-mark';

export function FundBrand() {
  return (
    <>
      <FundMark />
      <span className="brand-fund">
        <strong>Эндаумент-фонд</strong>
        <span>Заполярного университета</span>
      </span>
    </>
  );
}
