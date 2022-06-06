import React from "react";
import { DateRangePicker } from "rsuite";
import { addDays } from "date-fns";

const Ranges = [
  {
    label: "1 day",
    value: [new Date(), new Date()],
  },
  {
    label: "3 days",
    value: [new Date(), addDays(new Date(), 2)],
  },
  {
    label: "7 days",
    value: [new Date(), addDays(new Date(), 6)],
  },
  {
    label: "1 month",
    value: [new Date(), addDays(new Date(), 30)],
  },
  {
    label: "3 months",
    value: [new Date(), addDays(new Date(), 90)],
  },
];

const DateRange = ({ value, onChange }) => {
  return (
    <DateRangePicker
      format="dd-MM-yyyy HH:mm:ss"
      onChange={onChange}
      value={value}
      character=" - "
      ranges={Ranges}
    />
  );
};

export default DateRange;
